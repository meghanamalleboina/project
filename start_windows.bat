@echo off
REM NexaDS - Automated Data Science & Predictive Analytics
REM Windows One-Click Execution Batch Script

echo ==========================================================
echo Starting NexaDS Platform (FastAPI Backend + React Frontend)
echo ==========================================================

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.10+ from python.org.
    pause
    exit /b 1
)

REM Check Node
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH. Please install Node.js 18+ from nodejs.org.
    pause
    exit /b 1
)

echo [1/3] Installing Python dependencies...
python -m pip install -r requirements.txt

echo [2/3] Installing Node.js dependencies...
call npm install

echo [3/3] Launching Full-Stack Application...
echo Access NexaDS at http://localhost:3000
npm run dev
pause
