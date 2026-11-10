import os
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres123@localhost:5432/contact_db")

# Fallback gracefully to SQLite if PostgreSQL connection fails
try:
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        pass
except Exception as e:
    print(f"[Warning] PostgreSQL connection error: {e}. Falling back to SQLite database.")
    DATABASE_URL = "sqlite:///./contacts.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
