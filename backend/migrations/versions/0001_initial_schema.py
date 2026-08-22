"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-08-22 00:00:00

"""
from typing import Sequence, Union

import geoalchemy2
import sqlalchemy as sa
from alembic import op

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS pgcrypto")  # provides gen_random_uuid()

    op.create_table(
        "departments",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("contact_email", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "teams",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("department_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("status", sa.Text(), nullable=True),
        sa.Column("location", geoalchemy2.Geography(geometry_type="POINT", srid=4326), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.execute("CREATE INDEX ix_teams_location ON teams USING GIST (location)")

    op.create_table(
        "users",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("name", sa.Text(), nullable=True),
        sa.Column("email", sa.Text(), nullable=True, unique=True),
        sa.Column("phone", sa.Text(), nullable=True),
        sa.Column("password_hash", sa.Text(), nullable=True),
        sa.Column("role", sa.Text(), nullable=False),
        sa.Column("department_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("team_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("teams.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "device_tokens",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("fcm_token", sa.Text(), nullable=True),
        sa.Column("web_push_subscription", sa.dialects.postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "incidents",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.Text(), nullable=True),
        sa.Column("category", sa.Text(), nullable=False),
        sa.Column("status", sa.Text(), server_default="under_review"),
        sa.Column("severity", sa.Text(), nullable=True),
        sa.Column("priority_score", sa.Float(), nullable=True),
        sa.Column("confidence", sa.Float(), nullable=True),
        sa.Column("location", geoalchemy2.Geography(geometry_type="POINT", srid=4326), nullable=False),
        sa.Column("ward", sa.Text(), nullable=True),
        sa.Column("department_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("report_count", sa.Integer(), server_default="1"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.execute("CREATE INDEX ix_incidents_location ON incidents USING GIST (location)")

    op.create_table(
        "reports",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("incident_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id"), nullable=True),
        sa.Column("image_url", sa.Text(), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("location", geoalchemy2.Geography(geometry_type="POINT", srid=4326), nullable=False),
        sa.Column("device_id", sa.Text(), nullable=True),
        sa.Column("ip_address", sa.Text(), nullable=True),
        sa.Column("ai_category", sa.Text(), nullable=True),
        sa.Column("ai_confidence", sa.Float(), nullable=True),
        sa.Column("moderation_status", sa.Text(), server_default="pending"),
        sa.Column("is_blurred", sa.Boolean(), server_default=sa.text("false")),
        sa.Column("status", sa.Text(), server_default="submitted"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.execute("CREATE INDEX ix_reports_location ON reports USING GIST (location)")
    op.create_index(
        "ix_reports_device_ip_created",
        "reports",
        ["device_id", "ip_address", "created_at"],
    )

    op.create_table(
        "tickets",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("incident_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("incidents.id"), nullable=False),
        sa.Column("department_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("departments.id"), nullable=True),
        sa.Column("assigned_team_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("teams.id"), nullable=True),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("summary", sa.Text(), nullable=False),
        sa.Column("recommended_action", sa.Text(), nullable=False),
        sa.Column("sla_due_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("status", sa.Text(), server_default="open"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "alerts",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("title", sa.Text(), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("area", sa.Text(), nullable=True),
        sa.Column("severity", sa.Text(), nullable=True),
        sa.Column("valid_until", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "predictions",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("ward", sa.Text(), nullable=True),
        sa.Column("risk_type", sa.Text(), nullable=True),
        sa.Column("risk_score", sa.Float(), nullable=True),
        sa.Column("forecast_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("rainfall_amount", sa.Float(), nullable=True),
        sa.Column("historical_incident_count", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True, server_default=sa.text("gen_random_uuid()")),
        sa.Column("user_id", sa.dialects.postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=True),
        sa.Column("action", sa.Text(), nullable=False),
        sa.Column("entity_type", sa.Text(), nullable=False),
        sa.Column("entity_id", sa.dialects.postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("metadata", sa.dialects.postgresql.JSONB(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("predictions")
    op.drop_table("alerts")
    op.drop_table("tickets")
    op.drop_index("ix_reports_device_ip_created", table_name="reports")
    op.execute("DROP INDEX IF EXISTS ix_reports_location")
    op.drop_table("reports")
    op.execute("DROP INDEX IF EXISTS ix_incidents_location")
    op.drop_table("incidents")
    op.drop_table("device_tokens")
    op.drop_table("users")
    op.execute("DROP INDEX IF EXISTS ix_teams_location")
    op.drop_table("teams")
    op.drop_table("departments")
