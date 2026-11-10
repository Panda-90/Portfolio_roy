from sqlalchemy import Column, String
from database import Base

class Employee(Base):
    __tablename__ = "employees"

    employeeId = Column(String, primary_key=True, index=True)
    fullName = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    phone = Column(String, nullable=False)
    department = Column(String, nullable=False)
    position = Column(String, nullable=False)
    joiningDate = Column(String, nullable=False)