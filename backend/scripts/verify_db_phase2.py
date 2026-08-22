"""
Phase 2 Database & PostGIS Verification Script (Safe & Read-Only).
Does NOT print credentials or passwords.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "api")))
from app.config import settings
from sqlalchemy import create_engine, text

def run_db_checks():
    print("=" * 60)
    print("CivicGuard Phase 2: Neon PostgreSQL & PostGIS Verification")
    print("=" * 60)

    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        # Step 3: Connection & versions
        v = conn.execute(text("SELECT version();")).scalar()
        db_name = conn.execute(text("SELECT current_database();")).scalar()
        schema = conn.execute(text("SELECT current_schema();")).scalar()
        print("Database connection: PASS")
        print("PostgreSQL version:", v)
        print("Database name:", db_name)
        print("Schema:", schema)

        # Step 4: PostGIS verification
        print("\n--- PostGIS Verification ---")
        try:
            with engine.connect() as c2:
                pg_v = c2.execute(text("SELECT PostGIS_Version();")).scalar()
                print("PostGIS installed: YES")
                print("PostGIS version:", pg_v)
        except Exception as e:
            print("PostGIS installed: NO (not enabled yet or function missing)")

        try:
            with engine.connect() as c3:
                ext_rows = c3.execute(text("SELECT extname FROM pg_extension;")).fetchall()
                exts = [r[0] for r in ext_rows]
                print("Currently installed pg_extensions:", exts)
                print("Extension verified (postgis):", "YES" if "postgis" in exts else "NO")
        except Exception as e:
            print("Error checking pg_extension:", e)

        try:
            with engine.connect() as c4:
                avail_rows = c4.execute(text("SELECT name, default_version FROM pg_available_extensions WHERE name LIKE '%postgis%' OR name LIKE '%crypto%';")).fetchall()
                print("Available extensions:", avail_rows)
        except Exception as e:
            print("Error checking pg_available_extensions:", e)

        # Step 6: Current tables
        print("\n--- Information Schema Tables ---")
        try:
            with engine.connect() as c5:
                table_rows = c5.execute(text(
                    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
                )).fetchall()
                tables = [r[0] for r in table_rows]
                print(f"Tables in 'public' ({len(tables)}):", tables)
        except Exception as e:
            print("Error checking tables:", e)


if __name__ == "__main__":
    run_db_checks()
