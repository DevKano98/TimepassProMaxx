from datetime import date, datetime, timezone
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import Incident, Ticket, User
from app.schemas import IncidentAdminOut, IncidentAssign, IncidentDispatch, IncidentStatusUpdate
from app.services.ticket_service import generate_ticket

router = APIRouter(prefix="/api/admin/incidents", tags=["admin-incidents"])

_OFFICIAL_ROLES = ("admin", "control_room", "department_officer")


def _get_incident_or_404(db: Session, incident_id: UUID) -> Incident:
    incident = db.get(Incident, incident_id)
    if incident is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return incident


@router.get("", response_model=list[IncidentAdminOut])
def list_incidents(
    status_filter: Optional[str] = Query(default=None, alias="status"),
    severity: Optional[str] = Query(default=None),
    category: Optional[str] = Query(default=None),
    ward: Optional[str] = Query(default=None),
    department_id: Optional[UUID] = Query(default=None),
    date_from: Optional[date] = Query(default=None),
    date_to: Optional[date] = Query(default=None),
    current_user: User = Depends(require_role(*_OFFICIAL_ROLES)),
    db: Session = Depends(get_db),
) -> list[Incident]:
    query = db.query(Incident)

    if status_filter:
        query = query.filter(Incident.status == status_filter)
    if severity:
        query = query.filter(Incident.severity == severity)
    if category:
        query = query.filter(Incident.category == category)
    if ward:
        query = query.filter(Incident.ward == ward)
    if department_id:
        query = query.filter(Incident.department_id == department_id)
    if date_from:
        query = query.filter(Incident.created_at >= date_from)
    if date_to:
        query = query.filter(Incident.created_at <= date_to)

    return query.order_by(Incident.created_at.desc()).all()


@router.get("/{incident_id}", response_model=IncidentAdminOut)
def get_incident(
    incident_id: UUID,
    current_user: User = Depends(require_role(*_OFFICIAL_ROLES)),
    db: Session = Depends(get_db),
) -> Incident:
    return _get_incident_or_404(db, incident_id)


@router.post("/{incident_id}/verify", response_model=IncidentAdminOut)
def verify_incident(
    incident_id: UUID,
    current_user: User = Depends(require_role(*_OFFICIAL_ROLES)),
    db: Session = Depends(get_db),
) -> Incident:
    incident = _get_incident_or_404(db, incident_id)
    incident.status = "confirmed"
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/reject", response_model=IncidentAdminOut)
def reject_incident(
    incident_id: UUID,
    current_user: User = Depends(require_role(*_OFFICIAL_ROLES)),
    db: Session = Depends(get_db),
) -> Incident:
    incident = _get_incident_or_404(db, incident_id)
    incident.status = "rejected"
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/assign", response_model=IncidentAdminOut)
def assign_incident(
    incident_id: UUID,
    payload: IncidentAssign,
    current_user: User = Depends(require_role(*_OFFICIAL_ROLES)),
    db: Session = Depends(get_db),
) -> Incident:
    incident = _get_incident_or_404(db, incident_id)
    incident.department_id = payload.department_id
    incident.status = "assigned"
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.post("/{incident_id}/dispatch", response_model=IncidentAdminOut)
def dispatch_incident(
    incident_id: UUID,
    payload: IncidentDispatch,
    current_user: User = Depends(require_role(*_OFFICIAL_ROLES)),
    db: Session = Depends(get_db),
) -> Incident:
    incident = _get_incident_or_404(db, incident_id)

    existing_ticket = db.query(Ticket).filter(Ticket.incident_id == incident.id).first()
    if existing_ticket is None:
        ticket_data = generate_ticket(
            {
                "category": incident.category,
                "severity": incident.severity,
                "ward": incident.ward,
                "report_count": incident.report_count,
                "confidence": incident.confidence,
            }
        )
        ticket = Ticket(
            incident_id=incident.id,
            department_id=incident.department_id,
            assigned_team_id=payload.team_id,
            title=ticket_data["title"],
            summary=ticket_data["summary"],
            recommended_action=ticket_data["recommended_action"],
        )
        db.add(ticket)
    else:
        existing_ticket.assigned_team_id = payload.team_id
        db.add(existing_ticket)

    incident.status = "dispatched"
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.patch("/{incident_id}/status", response_model=IncidentAdminOut)
def update_incident_status(
    incident_id: UUID,
    payload: IncidentStatusUpdate,
    current_user: User = Depends(require_role(*_OFFICIAL_ROLES)),
    db: Session = Depends(get_db),
) -> Incident:
    incident = _get_incident_or_404(db, incident_id)
    incident.status = payload.status
    if payload.status == "resolved":
        incident.resolved_at = datetime.now(timezone.utc)
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident
