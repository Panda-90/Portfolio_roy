from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserResponse
from app.auth import require_admin

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.get("/employees", response_model=List[UserResponse])
def get_all_employees(
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """
    PRD: Admin -> Can view all Employee details
    Restricted to Admins only.
    """
    employees = db.query(User).filter(User.role == "Employee").all()
    return employees
