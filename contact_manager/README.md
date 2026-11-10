# Contact Management Application

A full-stack Contact Management Application implementing all requirements from the Product Requirements Document (PRD v1.0).

## 🚀 Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 (Modern SaaS Design), JavaScript (ES6+ Fetch/AJAX)
- **Backend / API**: FastAPI (Python), Pydantic v2 validation, SQLAlchemy ORM
- **Database**: PostgreSQL (with automatic SQLite fallback)
- **Icons & Typography**: Remix Icons, Inter & Outfit fonts

## 📋 Features

- **Full CRUD Operations**:
  - **Create**: Modal form with client-side & server-side validation (EmailStr, unique constraint, required fields).
  - **Read**: Live table display with contact avatar generation, phone, email, and company badges.
  - **View Details**: Dedicated detail modal displaying notes, formatted timestamps, and direct action links.
  - **Update**: Pre-filled edit modal to update contact details with instant DOM updates.
  - **Delete**: Confirmation dialog modal with deletion via AJAX.
- **Live Search / Filter**: Fast debounced search across name, email, company, and phone.
- **Toast Notifications**: Interactive feedback toasts for all user actions.
- **RESTful API**: Standardized JSON responses, error codes (`400`, `404`, `409`, `422`).

## ⚡ Quick Start

### 1. Run with Batch Launcher
Double-click `run_app.bat` to automatically seed sample data, start the FastAPI server on port 8002, and launch the UI in your default browser:
```cmd
run_app.bat
```

### 2. Manual Start
```bash
# Run database seeder (optional)
python backend/seed_data.py

# Launch FastAPI server
uvicorn backend.main:app --host 127.0.0.1 --port 8002 --reload
```
Access the application at: `http://127.0.0.1:8002`
Interactive API Docs (Swagger): `http://127.0.0.1:8002/docs`
