import sys
import os
from fastapi.testclient import TestClient

# Ensure app package is found
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.main import app
from app.database import Base, engine

# Ensure tables exist
Base.metadata.create_all(bind=engine)

client = TestClient(app)

def test_full_flow():
    print(">>> Testing Registration for Admin...")
    admin_payload = {
        "name": "Sarah Admin",
        "email": "sarah.admin@apexcorp.com",
        "password": "Password123!",
        "phone": "9876543210",
        "department": "Management",
        "position": "General Director",
        "role": "Admin"
    }
    res = client.post("/register", json=admin_payload)
    if res.status_code == 201:
        print(" [PASS] Admin registered successfully")
    elif res.status_code == 400 and "already registered" in res.text:
        print(" [INFO] Admin already registered from previous run")
    else:
        print(f" [FAIL] Register Admin failed: {res.status_code} {res.text}")

    print(">>> Testing Registration for Employee...")
    emp_payload = {
        "name": "John Employee",
        "email": "john.emp@apexcorp.com",
        "password": "Password123!",
        "phone": "9123456780",
        "department": "Engineering",
        "position": "Backend Developer",
        "role": "Employee"
    }
    res = client.post("/register", json=emp_payload)
    if res.status_code == 201:
        print(" [PASS] Employee registered successfully")
    elif res.status_code == 400 and "already registered" in res.text:
        print(" [INFO] Employee already registered from previous run")
    else:
        print(f" [FAIL] Register Employee failed: {res.status_code} {res.text}")

    print(">>> Testing Login for Admin...")
    res = client.post("/login", json={"email": "sarah.admin@apexcorp.com", "password": "Password123!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    admin_token = res.json()["access_token"]
    assert res.json()["role"] == "Admin"
    print(" [PASS] Admin Login successful. Token obtained.")

    print(">>> Testing Login for Employee...")
    res = client.post("/login", json={"email": "john.emp@apexcorp.com", "password": "Password123!"})
    assert res.status_code == 200, f"Login failed: {res.text}"
    emp_token = res.json()["access_token"]
    assert res.json()["role"] == "Employee"
    print(" [PASS] Employee Login successful. Token obtained.")

    print(">>> Testing /users/me for Employee...")
    res = client.get("/users/me", headers={"Authorization": f"Bearer {emp_token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "john.emp@apexcorp.com"
    print(" [PASS] /users/me returned correct details for Employee.")

    print(">>> Testing Employee -> GET /employee/admins (Should succeed)...")
    res = client.get("/employee/admins", headers={"Authorization": f"Bearer {emp_token}"})
    assert res.status_code == 200
    admins = res.json()
    assert len(admins) >= 1
    assert any(a["email"] == "sarah.admin@apexcorp.com" for a in admins)
    print(f" [PASS] Employee retrieved {len(admins)} Admin(s) successfully.")

    print(">>> Testing Employee -> GET /admin/employees (Should be FORBIDDEN 403)...")
    res = client.get("/admin/employees", headers={"Authorization": f"Bearer {emp_token}"})
    assert res.status_code == 403, f"Expected 403, got {res.status_code}"
    print(" [PASS] Access properly denied (403 Forbidden) for non-admin on /admin/employees.")

    print(">>> Testing Admin -> GET /admin/employees (Should succeed)...")
    res = client.get("/admin/employees", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    employees = res.json()
    assert len(employees) >= 1
    assert any(e["email"] == "john.emp@apexcorp.com" for e in employees)
    print(f" [PASS] Admin retrieved {len(employees)} Employee(s) successfully.")

    print("\n[SUCCESS] ALL BACKEND TESTS & ROLE-BASED ACCESS CHECKS PASSED PERFECTLY!\n")

if __name__ == "__main__":
    test_full_flow()

