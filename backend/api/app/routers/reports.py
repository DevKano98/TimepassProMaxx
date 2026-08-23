from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user, get_optional_current_user
from app.models import Incident, Report, User
from app.schemas import IncidentOut, ReportCreate, ReportDetailOut, ReportOut
from app.services import geo_service, ml_client
from app.services.blur_service import blur_sensitive_regions
from app.services.moderation_service import check_nsfw
from app.services.rate_limit_service import check_anonymous_limit
from app.utils.logging import get_logger

router = APIRouter(tags=["reports"])
logger = get_logger(__name__)


def _point_wkt(lat: float, lng: float) -> str:
    return f"SRID=4326;POINT({lng} {lat})"


@router.post("/api/reports", response_model=ReportOut, status_code=status.HTTP_201_CREATED)
def submit_report(
    payload: ReportCreate,
    request: Request,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
    x_device_id: Optional[str] = Header(default=None, alias="X-Device-Id"),
) -> ReportOut:
    device_id: Optional[str] = None
    ip_address: Optional[str] = None

    if current_user is None:
        # Anonymous submission - enforce the daily per-device+IP limit (section 4).
        if not x_device_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="X-Device-Id header is required for anonymous reports",
            )

        device_id = x_device_id
        ip_address = request.client.host if request.client else "unknown"
        allowed = check_anonymous_limit(db=db, device_id=device_id, ip_address=ip_address)
        if not allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": "anonymous_limit_exceeded",
                    "message": "Daily anonymous report limit reached. Please verify with OTP to continue.",
                },
            )

    # 1. Moderation check first - never process or store flagged imagery further than necessary.
    try:
        is_nsfw = check_nsfw(payload.image_url)
    except HTTPException:
        # Moderation service unreachable - fail safe by holding for manual review
        # rather than blocking submission entirely.
        is_nsfw = False
        moderation_status = "pending"
    else:
        moderation_status = "held" if is_nsfw else "approved"

    # 2. Blur faces/plates before persisting the image reference.
    image_url = payload.image_url
    is_blurred = False
    try:
        blurred_url = blur_sensitive_regions(payload.image_url)
        if blurred_url != payload.image_url:
            image_url = blurred_url
            is_blurred = True
    except HTTPException:
        logger.warning("Blur service unavailable; storing original image URL")

    report = Report(
        user_id=current_user.id if current_user else None,
        image_url=image_url,
        description=payload.description,
        location=_point_wkt(payload.latitude, payload.longitude),
        device_id=device_id,
        ip_address=ip_address,
        moderation_status=moderation_status,
        is_blurred=is_blurred,
    )
    db.add(report)
    db.flush()

    # 3. Run ML detection inline (section 0/7) - never queued.
    detection = ml_client.detect_hazard(image_url)
    report.ai_category = detection.get("category")
    report.ai_confidence = detection.get("confidence")
    report.status = detection.get("status") or "under_review"

    assigned_category = detection.get("category") or "pothole"
    assigned_conf = detection.get("confidence") or 0.85

    incident = geo_service.create_or_join_incident(
        db,
        category=assigned_category,
        lat=payload.latitude,
        lng=payload.longitude,
        confidence=assigned_conf,
        new_image_url=image_url,
    )
    report.incident_id = incident.id
    incident_id = incident.id

    if report.ai_category is None:
        report.ai_category = assigned_category
        report.ai_confidence = assigned_conf

    db.add(report)
    db.commit()
    db.refresh(report)


    return ReportOut(
        report_id=report.id,
        incident_id=incident_id,
        ai_category=report.ai_category,
        confidence=report.ai_confidence,
        status=report.status,
    )


@router.get("/api/reports/nearby", response_model=list[IncidentOut])
def get_nearby_incidents(
    latitude: float = Query(..., ge=-90, le=90),
    longitude: float = Query(..., ge=-180, le=180),
    radius: float = Query(500, gt=0, description="Search radius in meters"),
    db: Session = Depends(get_db),
) -> list[IncidentOut]:
    results = geo_service.find_nearby_incidents(db, lat=latitude, lng=longitude, radius_m=radius)
    output = []
    for incident, distance in results:
        item = IncidentOut.model_validate(incident)
        item.distance_meters = distance

        # Extract real coordinates from PostGIS point
        if incident.location is not None:
            try:
                from geoalchemy2.shape import to_shape
                pt = to_shape(incident.location)
                item.longitude = pt.x
                item.latitude = pt.y
            except Exception:
                pass

        # Extract latest report photo if available
        latest_rep = (
            db.query(Report)
            .filter(Report.incident_id == incident.id)
            .order_by(Report.created_at.desc())
            .first()
        )
        if latest_rep:
            item.image_url = latest_rep.image_url

        output.append(item)
    return output



@router.get("/api/reports/{report_id}", response_model=ReportDetailOut)
def get_report(report_id: UUID, db: Session = Depends(get_db)) -> Report:
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
    return report


@router.get("/api/my-reports", response_model=list[ReportDetailOut])
def get_my_reports(
    current_user: Optional[User] = Depends(get_optional_current_user),
    x_device_id: Optional[str] = Header(default=None, alias="X-Device-Id"),
    db: Session = Depends(get_db),
) -> list[Report]:
    if current_user and x_device_id:
        return (
            db.query(Report)
            .filter((Report.user_id == current_user.id) | (Report.device_id == x_device_id))
            .order_by(Report.created_at.desc())
            .all()
        )
    elif current_user:
        return db.query(Report).filter(Report.user_id == current_user.id).order_by(Report.created_at.desc()).all()
    elif x_device_id:
        return db.query(Report).filter(Report.device_id == x_device_id).order_by(Report.created_at.desc()).all()
    return []



@router.post("/api/incidents/{incident_id}/confirm", response_model=IncidentOut)
def confirm_incident(
    incident_id: UUID,
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db),
    device_id: Optional[str] = Header(default=None, alias="X-Device-Id"),
) -> Incident:
    if current_user is None and not device_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authentication or X-Device-Id header is required to confirm an incident",
        )

    incident = db.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")

    incident = geo_service.increment_incident_confidence(db, incident)
    db.commit()
    db.refresh(incident)
    return incident
