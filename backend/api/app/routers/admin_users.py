from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import require_role
from app.models import User
from app.schemas import UserCreate, UserOut
from app.utils.security import hash_password

router = APIRouter(prefix="/api/admin/users", tags=["admin-users"])


@router.get("", response_model=list[UserOut])
def list_users(
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
) -> list[User]:
    return db.query(User).order_by(User.created_at.desc()).all()


@router.post("", response_model=UserOut, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    current_user: User = Depends(require_role("admin")),
    db: Session = Depends(get_db),
) -> User:
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists.",
        )

    user = User(
        name=payload.name,
        email=payload.email,
        phone=payload.phone,
        role=payload.role,
        department_id=payload.department_id,
        password_hash=hash_password(payload.password) if payload.password else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
