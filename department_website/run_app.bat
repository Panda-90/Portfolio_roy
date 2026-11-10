@echo off
echo Starting Department Website...
echo Opening in default browser at http://127.0.0.1:8001
cd /d "%~dp0"
if exist ".venv\Scripts\python.exe" (
    set "PYTHON_EXE=.venv\Scripts\python.exe"
) else (
    set "PYTHON_EXE=python"
)
start http://127.0.0.1:8001
"%PYTHON_EXE%" -m uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
pause
