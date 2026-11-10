@echo off
echo Starting Contact Management Application...
echo Opening in default browser at http://127.0.0.1:8002
cd /d "%~dp0"

REM Find python executable: first check department_website venv or system python
if exist "..\department_website\.venv\Scripts\python.exe" (
    set "PYTHON_EXE=..\department_website\.venv\Scripts\python.exe"
) else if exist ".venv\Scripts\python.exe" (
    set "PYTHON_EXE=.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)

REM Run seed data if database is empty
"%PYTHON_EXE%" backend\seed_data.py

REM Open default browser
start http://127.0.0.1:8002

REM Start FastAPI app with uvicorn
"%PYTHON_EXE%" -m uvicorn backend.main:app --host 127.0.0.1 --port 8002 --reload
pause
