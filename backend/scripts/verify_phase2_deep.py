"""
Deep inspection and real PostGIS query execution against Neon PostgreSQL.
"""
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "api")))
from app.config import settings
from app.database import SessionLocal
from app.models import Incident, Report, Department, User
from app.services import geo_service
from sqlalchemy import create_engine, text

def run_deep_checks():
    print("=" * 60)
    print("CivicGuard Phase 2: Deep PostGIS & Schema Verification")
    print("=" * 60)

    engine = create_engine(settings.DATABASE_URL)

    # 1. Inspect columns
    print("\n[1] Inspecting Columns for Core Tables:")
    with engine.connect() as conn:
        cols = conn.execute(text("""
            SELECT table_name, column_name, data_type, udt_name, is_nullable
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name IN ('incidents', 'reports', 'teams', 'users', 'otp_codes')
            ORDER BY table_name, ordinal_position;
        """)).fetchall()
        curr_table = None
        for r in cols:
            t_name, c_name, d_type, udt, nullable = r
            if t_name != curr_table:
                curr_table = t_name
                print(f"\n  Table: {t_name}")
            print(f"    - {c_name}: {d_type} (udt: {udt}, nullable: {nullable})")

    # 2. Inspect PostGIS Geography / Geometry Columns
    print("\n[2] Inspecting PostGIS Geography / Geometry Columns:")
    with engine.connect() as conn:
        try:
            geog_rows = conn.execute(text("""
                SELECT f_table_name, f_geography_column, srid, type
                FROM geography_columns
                WHERE f_table_schema = 'public';
            """)).fetchall()
            print("  Geography Columns in 'public':")
            for r in geog_rows:
                print(f"    - Table: {r[0]}, Column: {r[1]}, SRID: {r[2]}, Type: {r[3]}")
        except Exception as e:
            print("  Error checking geography_columns:", e)

        try:
            geom_rows = conn.execute(text("""
                SELECT f_table_name, f_geometry_column, srid, type
                FROM geometry_columns
                WHERE f_table_schema = 'public';
            """)).fetchall()
            print("  Geometry Columns in 'public':")
            for r in geom_rows:
                print(f"    - Table: {r[0]}, Column: {r[1]}, SRID: {r[2]}, Type: {r[3]}")
        except Exception as e:
            print("  Error checking geometry_columns:", e)

    # 3. Inspect Spatial Indexes (GiST)
    print("\n[3] Inspecting Indexes (including Spatial GiST Indexes):")
    with engine.connect() as conn:
        idx_rows = conn.execute(text("""
            SELECT tablename, indexname, indexdef
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname;
        """)).fetchall()
        for r in idx_rows:
            is_spatial = "gist" in r[2].lower()
            tag = " [SPATIAL GiST]" if is_spatial else ""
            print(f"  - Table: {r[0]} | Index: {r[1]}{tag}\n    Def: {r[2]}")

    # 4. Test REAL ST_DWithin and ST_Distance queries
    print("\n[4] Testing REAL PostGIS ST_DWithin & ST_Distance against Neon:")
    with engine.connect() as conn:
        # Test direct spatial query using GeoAlchemy2/PostGIS syntax on Neon
        res_within = conn.execute(text("""
            SELECT ST_DWithin(
                ST_SetSRID(ST_MakePoint(72.9781, 19.2183), 4326)::geography,
                ST_SetSRID(ST_MakePoint(72.9790, 19.2190), 4326)::geography,
                200.0
            ) AS is_within_200m;
        """)).scalar()
        print(f"  ST_DWithin test (nearby ~120m vs 200m radius): {res_within} (Expected: True)")
        assert res_within is True

        res_far = conn.execute(text("""
            SELECT ST_DWithin(
                ST_SetSRID(ST_MakePoint(72.9781, 19.2183), 4326)::geography,
                ST_SetSRID(ST_MakePoint(77.2090, 28.6139), 4326)::geography,
                1000.0
            ) AS is_within_1km;
        """)).scalar()
        print(f"  ST_DWithin test (far ~1100km vs 1km radius): {res_far} (Expected: False)")
        assert res_far is False

        distance_val = conn.execute(text("""
            SELECT ST_Distance(
                ST_SetSRID(ST_MakePoint(72.9781, 19.2183), 4326)::geography,
                ST_SetSRID(ST_MakePoint(72.9790, 19.2190), 4326)::geography
            ) AS distance_meters;
        """)).scalar()
        print(f"  ST_Distance test (calculated by PostGIS): {distance_val:.2f} meters (Expected: ~122.5m)")
        assert 110.0 <= distance_val <= 135.0

    # 5. Test Application GeoService against Neon
    print("\n[5] Testing geo_service.py with live database session:")
    db = SessionLocal()
    try:
        # Create a test incident with ST_Point location
        test_inc = Incident(
            title="Test Pothole for PostGIS Verification",
            category="pothole",
            confidence=0.92,
            location="SRID=4326;POINT(72.9781 19.2183)",
            report_count=1,
            ward="Ward 12",
        )
        db.add(test_inc)
        db.commit()
        db.refresh(test_inc)
        print(f"  Created test incident ID: {test_inc.id}")

        # Query nearby using geo_service.find_nearby_incidents
        nearby = geo_service.find_nearby_incidents(
            db=db,
            lat=19.2185,
            lng=72.9782,
            radius_m=500.0,
            category="pothole",
        )
        print(f"  find_nearby_incidents returned {len(nearby)} incident(s)")
        assert len(nearby) >= 1
        found_inc, dist = nearby[0]
        print(f"  Found incident ID {found_inc.id} at PostGIS distance {dist:.2f}m")
        assert found_inc.id == test_inc.id

        # Query far away
        far_results = geo_service.find_nearby_incidents(
            db=db,
            lat=28.6139,
            lng=77.2090,
            radius_m=500.0,
            category="pothole",
        )
        print(f"  find_nearby_incidents (far away Delhi coords) returned {len(far_results)} incident(s)")
        assert len(far_results) == 0

        # Clean up test record
        db.delete(test_inc)
        db.commit()
        print("  Cleaned up test incident record.")
    finally:
        db.close()

    # 6. Check Spatial Index Usage with EXPLAIN
    print("\n[6] Testing EXPLAIN on Spatial ST_DWithin Query:")
    with engine.connect() as conn:
        explain_rows = conn.execute(text("""
            EXPLAIN
            SELECT id FROM incidents
            WHERE ST_DWithin(location, ST_SetSRID(ST_MakePoint(72.9781, 19.2183), 4326)::geography, 200.0);
        """)).fetchall()
        for r in explain_rows:
            print(f"  {r[0]}")

    print("\n>>> ALL PHASE 2 POSTGIS & DATABASE CHECKS PASSED SUCCESSFULLY! <<<")

if __name__ == "__main__":
    run_deep_checks()
