@echo off
title OpenCaption - Desktop AI Video Suite Launcher
cd /d "%~dp0"

echo =======================================================================
echo     OpenCaption - Standalone Desktop AI Video Suite (Local-First)
echo =======================================================================
echo [*] Starting Local Python AI Media Engine (port 8000)...

cd backend
if exist "venv\Scripts\activate.bat" (
    start "OpenCaption AI Engine" /min cmd /c "call venv\Scripts\activate.bat && python engine.py"
) else (
    start "OpenCaption AI Engine" /min cmd /c "python engine.py"
)
cd ..

echo [*] Starting Vite Frontend Studio (port 5173)...
cd frontend
start "OpenCaption UI" /min cmd /c "npm run dev"
cd ..

timeout /t 3 >nul

echo [*] Opening OpenCaption Studio in your default browser...
start http://localhost:5173

echo =======================================================================
echo   OpenCaption is now running!
echo   - Frontend: http://localhost:5173
echo   - AI Backend API: http://127.0.0.1:8000
echo   - Press Ctrl+C in this console or close the window when done.
echo =======================================================================
pause
