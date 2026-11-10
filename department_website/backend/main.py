from datetime import datetime, timedelta, timezone
import os

from dotenv import load_dotenv

from fastapi import FastAPI, Depends, HTTPException
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from sqlalchemy.orm import Session

from pwdlib import PasswordHash

from jose import JWTError, jwt

from backend.database import engine, Base, SessionLocal
from backend.models import User
from backend.schemas import UserCreate, UserLogin


load_dotenv()

security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "30")
)

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Department Website API"
)

app.mount(
    "/static",
    StaticFiles(directory="frontend"),
    name="static"
)

password_hash = PasswordHash.recommended()




def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")

        if user_id is None:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    return user


@app.get("/me")
def get_me(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "course": current_user.course,
        "email": current_user.email,
        "phone": current_user.phone
    }

@app.get("/")
def home():
    return FileResponse("frontend/index.html")

@app.get("/login")
def login_page():
    return FileResponse("frontend/login.html")

@app.post("/register")
def register(
    user: UserCreate,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    hashed_password = password_hash.hash(
        user.password
    )

    new_user = User(
        full_name=user.full_name,
        course=user.course,
        email=user.email,
        phone=user.phone,
        password=hashed_password
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful",
        "user_id": new_user.id
    }


@app.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db)
):

    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not password_hash.verify(
        user.password,
        db_user.password
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    expire = datetime.now(timezone.utc) + timedelta(
    minutes=ACCESS_TOKEN_EXPIRE_MINUTES
)

    token_data = {
        "user_id": db_user.id,
        "email": db_user.email,
        "exp": expire
    }

    token = jwt.encode(
        token_data,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return {
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "id": db_user.id,
            "full_name": db_user.full_name,
            "course": db_user.course,
            "email": db_user.email,
            "phone": db_user.phone
        }
    }

@app.get("/about")
def about():
    return FileResponse("frontend/about.html")

@app.get("/register")
def register_page():
    return FileResponse("frontend/register.html")


@app.get("/dashboard")
def dashboard_page():
    return FileResponse("frontend/dashboard.html")