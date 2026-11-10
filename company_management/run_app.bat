@echo off
echo Starting Company Management System for College Lab...
echo Opening in default browser at http://127.0.0.1:8000
set PYTHONPATH=%~dp0backend
start http://127.0.0.1:8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
pause
