"""
Pydantic v2 schemas for request and response bodies.

Every response schema sets model_config = ConfigDict(from_attributes=True) so
it can be built directly from SQLAlchemy ORM instances (e.g. ReportOut.model_validate(report_row)).
"""
from datetime import datetime
from typing import Any, Literal, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator


# ---------------------------------------------------------------------------
# Auth
# ---------------------------------------------------------------------------

class OTPRequest(BaseModel):
    email: EmailStr


class OTPVerify(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    role: str
    department_id: Optional[UUID] = None
    phone: Optional[str] = None
    password: Optional[str] = "password123"


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: Optional[str] = None
    email: Optional[str] = None
    role: str
    department_id: Optional[UUID] = None
    team_id: Optional[UUID] = None
    created_at: datetime



# ---------------------------------------------------------------------------
# Devices
# ---------------------------------------------------------------------------

class DeviceRegister(BaseModel):
    fcm_token: Optional[str] = None
    web_push_subscription: Optional[dict[str, Any]] = None

    @model_validator(mode="after")
    def exactly_one_token_type(self) -> "DeviceRegister":
        has_fcm = self.fcm_token is not None
        has_web = self.web_push_subscription is not None
        if has_fcm == has_web:
            raise ValueError(
                "Exactly one of fcm_token or web_push_subscription must be provided."
            )
        return self


class DeviceOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    fcm_token: Optional[str] = None
    web_push_subscription: Optional[dict[str, Any]] = None
    created_at: datetime


# ---------------------------------------------------------------------------
# Reports / Incidents
# ---------------------------------------------------------------------------

class ReportCreate(BaseModel):
    image_url: str
    description: Optional[str] = None
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)


class ReportOut(BaseModel):
    """Response returned by POST /api/reports."""

    model_config = ConfigDict(from_attributes=True)

    report_id: UUID
    incident_id: Optional[UUID] = None
    ai_category: Optional[str] = None
    confidence: Optional[float] = None
    status: str


class ReportDetailOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: Optional[UUID] = None
    incident_id: Optional[UUID] = None
    image_url: str
    description: Optional[str] = None
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None
    moderation_status: str
    is_blurred: bool
    status: str
    created_at: datetime


class IncidentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: Optional[str] = None
    category: str
    status: str
    severity: Optional[str] = None
    confidence: Optional[float] = None
    ward: Optional[str] = None
    report_count: int
    created_at: datetime
    distance_meters: Optional[float] = None


class IncidentAdminOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: Optional[str] = None
    category: str
    status: str
    severity: Optional[str] = None
    priority_score: Optional[float] = None
    confidence: Optional[float] = None
    ward: Optional[str] = None
    department_id: Optional[UUID] = None
    report_count: int
    created_at: datetime
    resolved_at: Optional[datetime] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    image_url: Optional[str] = None
    description: Optional[str] = None



class IncidentAssign(BaseModel):
    department_id: UUID


class IncidentDispatch(BaseModel):
    team_id: UUID


class IncidentStatusUpdate(BaseModel):
    status: Literal[
        "under_review",
        "confirmed",
        "assigned",
        "dispatched",
        "in_progress",
        "resolved",
        "rejected",
    ]


# ---------------------------------------------------------------------------
# Alerts
# ---------------------------------------------------------------------------

class AlertCreate(BaseModel):
    title: str
    message: str
    area: Optional[str] = None
    severity: Optional[str] = None
    valid_until: datetime


class AlertOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    title: str
    message: str
    area: Optional[str] = None
    severity: Optional[str] = None
    valid_until: datetime
    created_at: datetime


# ---------------------------------------------------------------------------
# Tickets / Teams
# ---------------------------------------------------------------------------

class TicketOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    incident_id: UUID
    department_id: Optional[UUID] = None
    assigned_team_id: Optional[UUID] = None
    title: str
    summary: str
    recommended_action: str
    sla_due_at: Optional[datetime] = None
    status: str
    created_at: datetime


class TicketStatusUpdate(BaseModel):
    status: Literal["en_route", "in_progress", "resolved"]
    completion_photo_url: Optional[str] = None


class TeamOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    department_id: Optional[UUID] = None
    status: Optional[str] = None
    created_at: datetime


# ---------------------------------------------------------------------------
# Analytics / Predictions
# ---------------------------------------------------------------------------

class AnalyticsSummary(BaseModel):
    total_incidents: int
    critical_incidents: int
    resolved_today: int
    delayed_incidents: int
    average_resolution_hours: Optional[float] = None


class PredictionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    ward: Optional[str] = None
    risk_type: Optional[str] = None
    risk_score: Optional[float] = None
    forecast_time: Optional[datetime] = None
    rainfall_amount: Optional[float] = None
    historical_incident_count: Optional[int] = None
    created_at: datetime


# ---------------------------------------------------------------------------
# Internal
# ---------------------------------------------------------------------------

class AIResultUpdate(BaseModel):
    ai_category: Optional[str] = None
    ai_confidence: Optional[float] = None
    status: Optional[str] = None
