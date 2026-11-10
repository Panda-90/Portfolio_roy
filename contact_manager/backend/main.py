from datetime import datetime, timezone
import os
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import engine, Base, get_db
from backend.models import Contact
from backend.schemas import ContactCreate, ContactUpdate, ContactResponse

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Contact Management API",
    version="1.0.0",
    description="RESTful API for Contact Management System built with FastAPI & PostgreSQL"
)

# Enable CORS for local development and portfolio embedding
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_DIR = Path(__file__).resolve().parent.parent / "frontend"

# Serve static files (CSS, JS)
if FRONTEND_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")

@app.get("/")
def serve_index():
    index_file = FRONTEND_DIR / "index.html"
    if index_file.exists():
        return FileResponse(index_file)
    return {"message": "Contact Management API is running. Check /docs for API documentation."}

@app.get("/api/contacts", response_model=List[ContactResponse])
def list_contacts(
    search: Optional[str] = Query(None, description="Search by name, email, or company"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db)
):
    query = db.query(Contact)
    if search:
        search_pattern = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Contact.first_name.ilike(search_pattern),
                Contact.last_name.ilike(search_pattern),
                Contact.email.ilike(search_pattern),
                Contact.company.ilike(search_pattern),
                Contact.phone.ilike(search_pattern)
            )
        )
    return query.order_by(Contact.id.desc()).offset(skip).limit(limit).all()

@app.get("/api/contacts/{contact_id}", response_model=ContactResponse)
def get_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Contact with ID {contact_id} not found")
    return contact

@app.post("/api/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_contact(payload: ContactCreate, db: Session = Depends(get_db)):
    # Check email uniqueness
    existing = db.query(Contact).filter(Contact.email.ilike(payload.email.strip())).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A contact with email '{payload.email}' already exists."
        )
    
    contact_data = payload.model_dump()
    new_contact = Contact(**contact_data)
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact

@app.put("/api/contacts/{contact_id}", response_model=ContactResponse)
def update_contact(contact_id: int, payload: ContactUpdate, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Contact with ID {contact_id} not found")
    
    # Check duplicate email on other contacts
    email_conflict = db.query(Contact).filter(
        Contact.email.ilike(payload.email.strip()),
        Contact.id != contact_id
    ).first()
    if email_conflict:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Another contact with email '{payload.email}' already exists."
        )
    
    for key, val in payload.model_dump().items():
        setattr(contact, key, val)
    
    contact.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(contact)
    return contact

@app.delete("/api/contacts/{contact_id}", status_code=status.HTTP_200_OK)
def delete_contact(contact_id: int, db: Session = Depends(get_db)):
    contact = db.query(Contact).filter(Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Contact with ID {contact_id} not found")
    
    db.delete(contact)
    db.commit()
    return {"detail": f"Contact {contact_id} deleted successfully", "id": contact_id}
