@echo off

set ROOT=C:\Users\ASUS\Desktop\PMS Team\PMS-Team-Project\PMS-all

:: Kill old processes on 8080 / 8081
for /f "tokens=5" %%P in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":8080"') do taskkill /PID %%P /F >nul 2>&1
for /f "tokens=5" %%P in ('netstat -ano ^| findstr "LISTENING" ^| findstr ":8081"') do taskkill /PID %%P /F >nul 2>&1
timeout /t 1 /nobreak >nul

:: Start MySQL
net start MySQL80 >nul 2>&1
net start MySQL >nul 2>&1

:: Start servers
start "auth-api :8081" "%ROOT%\run-auth.bat"
timeout /t 5 /nobreak >nul
start "schedul-member :8080" "%ROOT%\run-member.bat"

:: Open browser (refresh when server is ready)
start http://localhost:8080/login
