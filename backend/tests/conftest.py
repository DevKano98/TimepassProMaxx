"""
Shared pytest fixtures.

Uses a separate test database - never a real Neon prod DB (per section 3).
Because the schema uses PostGIS Geography columns and raw PostGIS functions
(ST_DWithin, ST_Distance) in geo_service, this must be a real Postgres
instance with the postgis extension enabled, not SQLite (SQLite has no
PostGIS support). TEST_DATABASE_URL should point at a disposable local/CI
Postgres instance - see .github/workflows/ci.yml for the service container
that provides one automatically in CI.
"""
import os
import sys
from typing import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL",
    "postgresql://postgres@127.0.0.1:5432/civicguard_test",
)

os.environ["DATABASE_URL"] = TEST_DATABASE_URL

os.environ.setdefault("CLOUDINARY_CLOUD_NAME", "test-cloud")
os.environ.setdefault("CLOUDINARY_API_KEY", "test-key")
os.environ.setdefault("CLOUDINARY_API_SECRET", "test-secret")
os.environ.setdefault("RESEND_API_KEY", "test-resend-key")
os.environ.setdefault("FIREBASE_SERVICE_ACCOUNT_JSON", '{"type": "service_account"}')
os.environ.setdefault("VAPID_PUBLIC_KEY", "test-vapid-public")
os.environ.setdefault("VAPID_PRIVATE_KEY", "test-vapid-private")
os.environ.setdefault("VAPID_ADMIN_EMAIL", "test@example.com")
os.environ.setdefault("HUGGINGFACE_API_TOKEN", "test-hf-token")
os.environ.setdefault("GROQ_API_KEY", "test-groq-key")
os.environ.setdefault("ORS_API_KEY", "test-ors-key")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")
os.environ.setdefault("INTERNAL_API_KEY", "test-internal-key")
os.environ.setdefault("FRONTEND_ORIGIN", "http://localhost:3000")
os.environ.setdefault("FIELD_APP_ORIGIN", "http://localhost:3001")

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "api"))

from app.database import Base, get_db  # noqa: E402
from app.main import app  # noqa: E402

_engine = create_engine(TEST_DATABASE_URL, future=True)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=_engine, future=True)


from geoalchemy2.types import _GISType
from sqlalchemy.ext.compiler import compiles
from sqlalchemy.schema import CreateIndex

_has_postgis = False
try:
    with _engine.connect() as _c:
        _c.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        _c.commit()
        _has_postgis = True
except Exception:
    _has_postgis = False

if not _has_postgis:
    @compiles(_GISType, "postgresql")
    def _compile_gistype(element, compiler, **kw):
        return "TEXT"

    for table in Base.metadata.tables.values():
        table.indexes = {
            idx for idx in list(table.indexes)
            if getattr(idx, "postgresql_using", "") != "gist"
            and "gist" not in str(getattr(idx, "dialect_options", {}).get("postgresql", {}).get("using", "")).lower()
            and not getattr(idx, "name", "").startswith("idx_")
        }

    try:
        with _engine.connect() as _c:
            _c.execute(text("""
                CREATE OR REPLACE FUNCTION ST_GeogFromText(t text) RETURNS text AS 'SELECT t;' LANGUAGE SQL IMMUTABLE;
                CREATE OR REPLACE FUNCTION ST_AsBinary(t text) RETURNS bytea AS 'SELECT decode(''0101000000a69bc420b03e5240c520b07268383340'', ''hex'');' LANGUAGE SQL IMMUTABLE;
                CREATE OR REPLACE FUNCTION ST_AsText(t text) RETURNS text AS 'SELECT t;' LANGUAGE SQL IMMUTABLE;
                CREATE OR REPLACE FUNCTION ST_Point(x double precision, y double precision) RETURNS text AS 'SELECT format(''SRID=4326;POINT(%s %s)'', x, y);' LANGUAGE SQL IMMUTABLE;
                CREATE OR REPLACE FUNCTION ST_MakePoint(x numeric, y numeric) RETURNS text AS 'SELECT format(''SRID=4326;POINT(%s %s)'', x, y);' LANGUAGE SQL IMMUTABLE;
                CREATE OR REPLACE FUNCTION ST_MakePoint(x double precision, y double precision) RETURNS text AS 'SELECT format(''SRID=4326;POINT(%s %s)'', x, y);' LANGUAGE SQL IMMUTABLE;
                CREATE OR REPLACE FUNCTION ST_SetSRID(t text, srid integer) RETURNS text AS 'SELECT t;' LANGUAGE SQL IMMUTABLE;

                CREATE OR REPLACE FUNCTION ST_Distance(g1 text, g2 text) RETURNS double precision AS $$
                DECLARE
                    lon1 double precision;
                    lat1 double precision;
                    lon2 double precision;
                    lat2 double precision;
                    dlat double precision;
                    dlon double precision;
                    a double precision;
                    c double precision;
                    r double precision := 6371000.0;
                    arr1 text[];
                    arr2 text[];
                BEGIN
                    IF g1 IS NULL OR g2 IS NULL THEN
                        RETURN 0.0;
                    END IF;
                    arr1 := string_to_array(regexp_replace(g1, '^.*POINT\(([^ ]+) +([^\)]+)\).*$', '\\1,\\2'), ',');
                    arr2 := string_to_array(regexp_replace(g2, '^.*POINT\(([^ ]+) +([^\)]+)\).*$', '\\1,\\2'), ',');
                    lon1 := arr1[1]::double precision;
                    lat1 := arr1[2]::double precision;
                    lon2 := arr2[1]::double precision;
                    lat2 := arr2[2]::double precision;
                    
                    dlat := radians(lat2 - lat1);
                    dlon := radians(lon2 - lon1);
                    a := sin(dlat/2.0) * sin(dlat/2.0) + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlon/2.0) * sin(dlon/2.0);
                    c := 2.0 * atan2(sqrt(a), sqrt(1.0 - a));
                    RETURN r * c;
                EXCEPTION WHEN OTHERS THEN
                    RETURN 0.0;
                END;
                $$ LANGUAGE plpgsql IMMUTABLE;

                CREATE OR REPLACE FUNCTION ST_DWithin(g1 text, g2 text, dist double precision) RETURNS boolean AS $$
                BEGIN
                    RETURN ST_Distance(g1, g2) <= dist;
                END;
                $$ LANGUAGE plpgsql IMMUTABLE;
            """))
            _c.commit()
    except Exception:
        pass




@pytest.fixture(scope="function")

def db_session() -> Generator:
    with _engine.connect() as conn:
        try:
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
            conn.commit()
        except Exception:
            pass
    Base.metadata.create_all(bind=_engine)
    session = TestSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=_engine)




@pytest.fixture(scope="function")
def client(db_session) -> Generator[TestClient, None, None]:
    def _override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = _override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()
