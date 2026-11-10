@echo off
title Web Lab Project Launcher
cls
echo =========================================================
echo             WEB TECHNOLOGY LAB PROJECT LAUNCHER          
echo =========================================================
echo.
echo  [1] Launch Master Portfolio & Lab Hub
echo  [2] Launch Company Management System     (Port 8000)
echo  [3] Launch Department Website           (Port 8001)
echo  [4] Launch Contact Manager               (Port 8002)
echo  [5] Launch Employee Management System   (Port 8003)
echo  [6] Launch Weather AJAX Application     (Exp 09)
echo  [0] Exit
echo.
echo =========================================================
set /p choice="Enter your choice [0-6]: "

if "%choice%"=="1" goto launch_portfolio
if "%choice%"=="2" goto launch_company
if "%choice%"=="3" goto launch_dept
if "%choice%"=="4" goto launch_contact
if "%choice%"=="5" goto launch_employee
if "%choice%"=="6" goto launch_weather
if "%choice%"=="0" exit
echo Invalid choice. Exiting...
pause
exit

:launch_portfolio
start "" "%~dp0index.html"
exit

:launch_company
start "" "%~dp0company_management\run_app.bat"
exit

:launch_dept
start "" "%~dp0department_website\run_app.bat"
exit

:launch_contact
start "" "%~dp0contact_manager\run_app.bat"
exit

:launch_employee
start "" "%~dp0employee-management-system\run_app.bat"
exit

:launch_weather
start "" "%~dp0experiment-9-weather-ajax\index.html"
exit

