from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

from app.database import engine, Base
from app.routers import auth_routes, employee_routes, admin_routes

# Create database tables automatically
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Company Management System API",
    description="Backend API for Employee and Admin Management System",
    version="1.0.0"
)

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_routes.router)
app.include_router(employee_routes.router)
app.include_router(admin_routes.router)

# Mount frontend static files
frontend_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend"))
if os.path.exists(frontend_dir):
    app.mount("/static", StaticFiles(directory=frontend_dir), name="static")

    @app.get("/")
    def serve_home():
        return FileResponse(os.path.join(frontend_dir, "index.html"))

    @app.get("/login.html")
    def serve_login():
        return FileResponse(os.path.join(frontend_dir, "login.html"))

    @app.get("/register.html")
    def serve_register():
        return FileResponse(os.path.join(frontend_dir, "register.html"))

    @app.get("/employee-dashboard.html")
    def serve_employee_dash():
        return FileResponse(os.path.join(frontend_dir, "employee-dashboard.html"))

    @app.get("/admin-dashboard.html")
    def serve_admin_dash():
        return FileResponse(os.path.join(frontend_dir, "admin-dashboard.html"))
