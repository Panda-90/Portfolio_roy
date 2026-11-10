# Company Employee & Admin Management System (College Lab Project)

A full-stack, role-based company portal developed using **Python FastAPI**, **SQLAlchemy ORM**, **JWT (JSON Web Tokens)** authentication, and modern responsive **HTML5 / CSS3 / JavaScript**.

---

## 🎯 Features

1. **User Registration & Secure Authentication**
   - Register as an **Employee** or **Admin**.
   - Passwords securely hashed with **bcrypt**.
   - Session tokens generated with **JWT (HS256)**.
   - Protected API routes and client-side page guards.

2. **Role-Based Access & Dashboards**
   - **Employee Dashboard:**
     - View own profile information.
     - View all company Administrators' details (`GET /employee/admins`).
   - **Admin Dashboard:**
     - View own administrator profile.
     - View complete directory of all registered Employees (`GET /admin/employees`) with a real-time live search filter.

3. **RESTful APIs**
   - `POST /register`: Register user with role.
   - `POST /login`: Authenticate and receive JWT.
   - `GET /users/me`: Current user details.
   - `GET /employee/admins`: List of admins (accessible by authenticated users).
   - `GET /admin/employees`: List of employees (restricted strictly to Admins).

4. **Database**
   - Configured out-of-the-box with **SQLite** (`sqlite:///./company.db`) for zero-configuration college lab presentation and viva demo.
   - Fully compatible with **PostgreSQL** by updating the `DATABASE_URL` environment variable.

---

## 🚀 How to Run the Project

### Method 1: Double-Click (Easiest)
Simply double-click **`run_app.bat`** in the project folder! It will automatically launch the server and open your browser at `http://127.0.0.1:8000`.

### Method 2: Command Line

1. Open PowerShell or Command Prompt in the project folder (`d:\Company Managemen`).
2. Set the python path and start the FastAPI server:
```powershell
$env:PYTHONPATH = "d:\Company Managemen\backend"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
3. Open your browser and navigate to:
   - **Web Application:** `http://127.0.0.1:8000`
   - **Interactive Swagger API Docs:** `http://127.0.0.1:8000/docs`

---

## 🧪 Running Automated Tests

Run the included automated verification script to demo role-based security and API responses for your lab evaluation:
```powershell
$env:PYTHONPATH = "d:\Company Managemen\backend"
python test_api.py
```

---

## 👥 Demo Credentials

You can use the pre-created test accounts or register your own:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `sarah.admin@apexcorp.com` | `Password123!` |
| **Employee** | `john.emp@apexcorp.com` | `Password123!` |
