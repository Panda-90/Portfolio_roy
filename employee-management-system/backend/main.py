from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session

from database import engine, get_db, Base
import models

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Creates the "employees" table if it doesn't exist yet
Base.metadata.create_all(bind=engine)

class EmployeeSchema(BaseModel):
    employeeId: str
    fullName: str
    email: str
    phone: str
    department: str
    position: str
    joiningDate: str

class LoginData(BaseModel):
    username: str
    password: str

@app.get("/")
def home():
    return {"message": "Employee Management API is running"}

@app.get("/employees")
def get_employees(db: Session = Depends(get_db)):
    return db.query(models.Employee).all()

@app.post("/login")
def login(data: LoginData):
    if data.username == "admin" and data.password == "admin123":
        return {"message": "Login successful"}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/employees")
def add_employee(employee: EmployeeSchema, db: Session = Depends(get_db)):
    db_employee = models.Employee(**employee.model_dump())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return {"message": "Employee registered successfully", "employee": db_employee}

class EmployeeUpdateSchema(BaseModel):
    fullName: str
    email: str
    phone: str
    department: str
    position: str
    joiningDate: str
    employeeId: str | None = None

@app.put("/employees/{employee_id}")
def update_employee(employee_id: str, updated: EmployeeUpdateSchema, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.employeeId == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Ensure email is not in use by another employee
    existing = db.query(models.Employee).filter(
        models.Employee.email == updated.email,
        models.Employee.employeeId != employee_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email is already used by another employee")

    employee.fullName = updated.fullName
    employee.email = updated.email
    employee.phone = updated.phone
    employee.department = updated.department
    employee.position = updated.position
    employee.joiningDate = updated.joiningDate

    db.commit()
    db.refresh(employee)
    return {"message": "Employee updated successfully", "employee": employee}

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: str, db: Session = Depends(get_db)):
    employee = db.query(models.Employee).filter(models.Employee.employeeId == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    db.delete(employee)
    db.commit()
    return {"message": "Employee deleted successfully", "employeeId": employee_id}