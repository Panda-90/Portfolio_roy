# Employee Management System

A modern employee dashboard application built with a separate frontend and a FastAPI backend powered by PostgreSQL.

## Project Structure

The repository is neatly separated into frontend and backend directories:

```text
employee-management-system/
├── backend/      # FastAPI Python application
└── frontend/     # HTML, CSS, and Vanilla JS UI
```

## Setup Instructions

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```
2. **Install dependencies:**
   Ensure you have a virtual environment active, then install the required packages (like `fastapi`, `uvicorn`, `sqlalchemy`, and `psycopg2-binary`).
3. **Database Configuration:**
   Ensure your `.env` file contains your PostgreSQL `DATABASE_URL`:
   ```env
   DATABASE_URL=postgresql://username:password@localhost:5432/employee_dashboard
   ```
4. **Run the server:**
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://127.0.0.1:8000`.

### Frontend Setup

The frontend consists of static files that interact directly with the backend API. 
1. Open the `frontend` folder.
2. Open `index.html` in your web browser. 
   
*(Note: Ensure your FastAPI backend is running so the frontend can successfully `fetch` data!)*
