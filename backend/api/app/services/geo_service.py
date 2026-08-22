"""
PostGIS-backed geo queries plus the incident-clustering rule from section 7
of the spec.

Clustering rule, implemented exactly as specified:
  1. Find nearby incidents of the same category, not resolved/rejected, within 200m.
  2. For each candidate, compare the new report's image against the candidate's
     most recent report image via CLIP cosine similarity.
  3. If similarity > 0.85 AND the candidate was created/updated within the last
     30 minutes -> join that incident (increment report_count).
  4. Otherwise -> create a new Incident row.
"""
from datetime import datetime, timedelta, timezone
from typing import Optional
from uuid import UUID

from geoalchemy2.functions import ST_DWithin, ST_Distance, ST_SetSRID, ST_MakePoint
from sqlalchemy import cast, select
from sqlalchemy.orm import Session

from app.models import Incident, Report
from app.services.clip_service import get_image_similarity
from app.utils.logging import get_logger

logger = get_logger(__name__)

CLUSTER_RADIUS_METERS = 200
CLUSTER_SIMILARITY_THRESHOLD = 0.85
CLUSTER_RECENCY_MINUTES = 30

_EXCLUDED_STATUSES = ("resolved", "rejected")


def _point(lat: float, lng: float):
    return ST_SetSRID(ST_MakePoint(lng, lat), 4326)


def find_nearby_incidents(
    db: Session,
    lat: float,
    lng: float,
    radius_m: float,
    category: Optional[str] = None,
    exclude_statuses: Optional[tuple[str, ...]] = None,
) -> list[tuple[Incident, float]]:
    """Returns (Incident, distance_meters) tuples within radius_m, nearest first."""
    point = _point(lat, lng)
    distance_expr = ST_Distance(Incident.location, point)

    query = select(Incident, distance_expr.label("distance_m")).where(
        ST_DWithin(Incident.location, point, radius_m)
    )
    if category is not None:
        query = query.where(Incident.category == category)
    if exclude_statuses:
        query = query.where(Incident.status.not_in(exclude_statuses))

    query = query.order_by(distance_expr.asc())
    rows = db.execute(query).all()
    return [(row[0], row[1]) for row in rows]


def create_or_join_incident(
    db: Session,
    *,
    category: str,
    lat: float,
    lng: float,
    confidence: Optional[float],
    new_image_url: str,
) -> Incident:
    """Implements the clustering rule from section 7."""
    candidates = find_nearby_incidents(
        db,
        lat=lat,
        lng=lng,
        radius_m=CLUSTER_RADIUS_METERS,
        category=category,
        exclude_statuses=_EXCLUDED_STATUSES,
    )

    now = datetime.now(timezone.utc)
    recency_cutoff = now - timedelta(minutes=CLUSTER_RECENCY_MINUTES)

    for candidate, _distance in candidates:
        # The incidents table (section 5) has no updated_at column, so
        # created_at is the best available "last touched" signal here.
        if candidate.created_at is None or candidate.created_at < recency_cutoff:
            continue

        most_recent_report = (
            db.query(Report)
            .filter(Report.incident_id == candidate.id)
            .order_by(Report.created_at.desc())
            .first()
        )
        if most_recent_report is None:
            continue

        try:
            similarity = get_image_similarity(new_image_url, most_recent_report.image_url)
        except Exception:
            # If the HF Inference API is down, don't fail report submission -
            # just treat this candidate as non-matching and fall through to
            # creating a new incident (or trying the next candidate).
            logger.exception("Duplicate-detection call failed; skipping this candidate")
            continue
        if similarity > CLUSTER_SIMILARITY_THRESHOLD:
            candidate.report_count += 1
            db.add(candidate)
            db.flush()
            return candidate

    new_incident = Incident(
        category=category,
        confidence=confidence,
        location=_point(lat, lng),
        report_count=1,
    )
    db.add(new_incident)
    db.flush()
    return new_incident


def increment_incident_confidence(db: Session, incident: Incident) -> Incident:
    """Recomputes a simple confidence value after a confirm action bumps report_count."""
    incident.report_count += 1
    base_confidence = incident.confidence or 0.5
    # Each additional confirmation nudges confidence up, capped at 0.99.
    incident.confidence = min(0.99, base_confidence + 0.05)
    db.add(incident)
    db.flush()
    return incident
