from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import Ticket, User
from app.schemas import TicketOut, TicketStatusUpdate

router = APIRouter(prefix="/api/field", tags=["field-team"])


def _get_ticket_or_404(db: Session, ticket_id: UUID) -> Ticket:
    ticket = db.get(Ticket, ticket_id)
    if ticket is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    return ticket


@router.get("/assignments", response_model=list[TicketOut])
def list_assignments(
    current_user: User = Depends(require_role("field_team")),
    db: Session = Depends(get_db),
) -> list[Ticket]:
    if current_user.team_id is None:
        return []
    return (
        db.query(Ticket)
        .filter(Ticket.assigned_team_id == current_user.team_id)
        .order_by(Ticket.created_at.desc())
        .all()
    )


@router.get("/assignments/{ticket_id}", response_model=TicketOut)
def get_assignment(
    ticket_id: UUID,
    current_user: User = Depends(require_role("field_team")),
    db: Session = Depends(get_db),
) -> Ticket:
    ticket = _get_ticket_or_404(db, ticket_id)
    if ticket.assigned_team_id != current_user.team_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to your team")
    return ticket


@router.patch("/assignments/{ticket_id}/status", response_model=TicketOut)
def update_assignment_status(
    ticket_id: UUID,
    payload: TicketStatusUpdate,
    current_user: User = Depends(require_role("field_team")),
    db: Session = Depends(get_db),
) -> Ticket:
    ticket = _get_ticket_or_404(db, ticket_id)
    if ticket.assigned_team_id != current_user.team_id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not assigned to your team")

    ticket.status = payload.status
    # Note: the tickets table (section 5) has no column for a completion photo,
    # so payload.completion_photo_url is accepted for forward-compatibility but
    # not persisted in this version. Add a column + field before relying on it.
    db.add(ticket)
    db.commit()
    db.refresh(ticket)
    return ticket
