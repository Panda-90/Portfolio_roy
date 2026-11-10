import os
import sys
from datetime import datetime, timezone
from pathlib import Path

# Add project root to sys.path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from backend.database import SessionLocal, engine, Base
from backend.models import Contact

Base.metadata.create_all(bind=engine)

sample_contacts = [
    {
        "first_name": "Alexander",
        "last_name": "Pierce",
        "email": "alex.pierce@innovatech.io",
        "phone": "+1 (555) 349-2810",
        "company": "InnovaTech Solutions",
        "address": "450 Market Street, San Francisco, CA",
        "notes": "Key technical lead for cloud infrastructure and distributed systems."
    },
    {
        "first_name": "Sophia",
        "last_name": "Chen",
        "email": "sophia.chen@nexura.ai",
        "phone": "+1 (555) 782-4190",
        "company": "Nexura AI Labs",
        "address": "12 Innovation Way, Boston, MA",
        "notes": "Met at International AI Summit 2026. Working on LLM agents."
    },
    {
        "first_name": "Marcus",
        "last_name": "Vance",
        "email": "marcus.vance@apexdesign.co",
        "phone": "+44 20 7946 0912",
        "company": "Apex UI/UX Studio",
        "address": "88 Kingsway, London, UK",
        "notes": "Collaborator for frontend design systems and Figma prototypes."
    },
    {
        "first_name": "Elena",
        "last_name": "Rostova",
        "email": "elena.rostova@quantumfin.com",
        "phone": "+1 (555) 902-3341",
        "company": "Quantum Financial",
        "address": "Wall Street Center, New York, NY",
        "notes": "Discussed PostgreSQL enterprise clustering and high-concurrency optimization."
    }
]

def seed():
    db = SessionLocal()
    try:
        count = db.query(Contact).count()
        if count == 0:
            print("Seeding initial contacts...")
            for data in sample_contacts:
                contact = Contact(**data)
                db.add(contact)
            db.commit()
            print(f"Successfully seeded {len(sample_contacts)} contacts!")
        else:
            print(f"Database already has {count} contact(s). Skipping seed.")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
