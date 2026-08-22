from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import Team, User
from app.schemas import TeamOut

router = APIRouter(prefix="/api/admin/teams", tags=["admin-teams"])


@router.get("", response_model=list[TeamOut])
def list_teams(
    current_user: User = Depends(require_role("admin", "control_room", "department_officer")),
    db: Session = Depends(get_db),
) -> list[Team]:
    """
    Backs the dashboard's "team management" feature: lists every team with its
    status/location/department. Do not skip this - it's easy to forget.
    """
    return db.query(Team).order_by(Team.name.asc()).all()
