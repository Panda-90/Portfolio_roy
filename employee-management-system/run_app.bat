@echo off
echo Starting Employee Management System...
echo Opening frontend in default browser...
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
    set "PYTHON_EXE=.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)
start "" "%~dp0frontend\index.html"
echo Starting Backend API at http://127.0.0.1:8003 ...
cd "%~dp0backend"
"%PYTHON_EXE%" -m uvicorn main:app --host 127.0.0.1 --port 8003 --reload
pause
