import sys
import os
import uuid

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "api")))

from app.database import SessionLocal
from app.models import User, Department, Team
from app.utils.security import hash_password

def seed():
    db = SessionLocal()
    try:
        # 1. Ensure default departments
        dept_pwd = db.query(Department).filter(Department.name == "Public Works & Roads").first()
        if not dept_pwd:
            dept_pwd = Department(id=str(uuid.uuid4()), name="Public Works & Roads")
            db.add(dept_pwd)
            db.flush()

        dept_san = db.query(Department).filter(Department.name == "Sanitation & Waste").first()
        if not dept_san:
            dept_san = Department(id=str(uuid.uuid4()), name="Sanitation & Waste")
            db.add(dept_san)
            db.flush()

        # 2. Ensure default team
        team = db.query(Team).filter(Team.name == "Rapid Response Team 1").first()
        if not team:
            team = Team(id=str(uuid.uuid4()), name="Rapid Response Team 1", department_id=dept_pwd.id, status="available")
            db.add(team)
            db.flush()

        users_to_seed = [
            {"email": "admin@civicguard.gov", "name": "Director Admin", "role": "admin", "dept": None, "team": None},
            {"role": "control_room", "name": "Control Room Operator", "email": "control@civicguard.gov", "dept": None, "team": None},
            {"role": "department_officer", "name": "Public Works Head", "email": "roads.officer@civicguard.gov", "dept": dept_pwd.id, "team": None},
            {"role": "department_officer", "name": "Public Works Head", "email": "pwd_head@civicguard.gov", "dept": dept_pwd.id, "team": None},
            {"role": "field_team", "name": "Field Team Lead", "email": "field1@civicguard.gov", "dept": dept_pwd.id, "team": team.id},
            {"role": "field_team", "name": "Field Team Alpha", "email": "field_alpha@civicguard.gov", "dept": dept_pwd.id, "team": team.id},
        ]

        hashed_pw = hash_password("password123")

        for u in users_to_seed:
            existing = db.query(User).filter(User.email == u["email"]).first()
            if not existing:
                new_u = User(
                    id=str(uuid.uuid4()),
                    email=u["email"],
                    name=u["name"],
                    role=u["role"],
                    password_hash=hashed_pw,
                    department_id=u["dept"],
                    team_id=u["team"],
                )
                db.add(new_u)
                print(f"Created user: {u['email']} ({u['role']})")
            else:
                existing.password_hash = hashed_pw
                existing.role = u["role"]
                existing.department_id = u["dept"]
                existing.team_id = u["team"]
                print(f"Updated user: {u['email']} password to password123")

        db.commit()
        print("All users seeded successfully in Neon PostgreSQL!")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
