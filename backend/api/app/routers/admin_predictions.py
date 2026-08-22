from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import Prediction, User
from app.schemas import PredictionOut

router = APIRouter(prefix="/api/admin/predictions", tags=["admin-predictions"])


@router.get("", response_model=list[PredictionOut])
def list_predictions(
    current_user: User = Depends(require_role("admin", "control_room", "department_officer")),
    db: Session = Depends(get_db),
) -> list[Prediction]:
    return db.query(Prediction).order_by(Prediction.forecast_time.desc()).all()
