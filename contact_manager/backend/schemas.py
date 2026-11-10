from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, Field

class ContactBase(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone: str = Field(..., min_length=3, max_length=50)
    address: Optional[str] = Field(None, max_length=255)
    company: Optional[str] = Field(None, max_length=100)
    notes: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactUpdate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
