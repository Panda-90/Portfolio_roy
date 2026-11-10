from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.schemas import UserResponse
from app.auth import get_current_user

router = APIRouter(prefix="/employee", tags=["Employee"])

@router.get("/admins", response_model=List[UserResponse])
def get_admin_details(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    PRD: Employee -> Can view Admin details
    Any authenticated user (Employee or Admin) can view the list of Admins.
    """
    admins = db.query(User).filter(User.role == "Admin").all()
    return admins
