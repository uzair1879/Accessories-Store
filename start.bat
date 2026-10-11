@echo off
title Accessories Store
cd /d "%~dp0"
color 0A

echo ============================================
echo    ACCESSORIES STORE
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 (
  echo [ERROR] Node.js not installed. Get it from https://nodejs.org
  pause & exit /b
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install --no-audit --no-fund
  if errorlevel 1 (
    echo [ERROR] npm install failed. Run as Administrator.
    pause & exit /b
  )
)

echo Starting server...
echo.
echo   Store:      http://localhost:3000
echo   Admin code: 678954321   ^(footer email box^)
echo   Admin pass: admin123
echo.
echo   Keep this window open. Press Ctrl+C to stop.
echo ============================================
echo.

start "" http://localhost:3000
call npm start
pause