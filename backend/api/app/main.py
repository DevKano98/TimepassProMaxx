from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import (
    admin_analytics,
    admin_incidents,
    admin_predictions,
    admin_teams,
    admin_users,
    alerts,
    auth,
    devices,
    field_team,
    internal,
    reports,
)

app = FastAPI(title="CivicGuard API", version="1.0.0")

# Build CORS origins list from settings and standard local dev ports
_cors_origins = {
    settings.FRONTEND_ORIGIN,
    settings.FIELD_APP_ORIGIN,
    "https://timepass-pro-maxx.vercel.app",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
}

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin for origin in _cors_origins if origin],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/health")
def health() -> dict[str, str]:
    """
    Must respond in milliseconds with no DB call and no external calls - this
    backs both Render's health check and an external uptime pinger.
    """
    return {"status": "ok"}


app.include_router(auth.router)
app.include_router(devices.router)
app.include_router(reports.router)
app.include_router(alerts.router)
app.include_router(admin_incidents.router)
app.include_router(admin_teams.router)
app.include_router(admin_users.router)
app.include_router(admin_analytics.router)
app.include_router(admin_predictions.router)
app.include_router(field_team.router)
app.include_router(internal.router)

