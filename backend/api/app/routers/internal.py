from uuid import UUID

from fastapi import APIRouter, Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from app.config import settings
from app.database import get_db
from app.models import Report
from app.schemas import AIResultUpdate, ReportDetailOut

router = APIRouter(prefix="/api/internal", tags=["internal"])


def verify_internal_api_key(x_internal_api_key: str = Header(..., alias="X-Internal-Api-Key")) -> None:
    if x_internal_api_key != settings.INTERNAL_API_KEY:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid internal API key")


@router.patch(
    "/reports/{report_id}/ai-result",
    response_model=ReportDetailOut,
    dependencies=[Depends(verify_internal_api_key)],
)
def update_ai_result(report_id: UUID, payload: AIResultUpdate, db: Session = Depends(get_db)) -> Report:
    """
    Not called in this version, since ML inference runs inline in
    POST /api/reports (section 0/7). Built anyway so the pattern exists if
    ML result processing is ever split into an async flow later.
    """
    report = db.get(Report, report_id)
    if report is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")

    if payload.ai_category is not None:
        report.ai_category = payload.ai_category
    if payload.ai_confidence is not None:
        report.ai_confidence = payload.ai_confidence
    if payload.status is not None:
        report.status = payload.status

    db.add(report)
    db.commit()
    db.refresh(report)
    return report
