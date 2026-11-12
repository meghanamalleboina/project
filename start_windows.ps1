# NexaDS - Automated Data Science & Predictive Analytics
# Windows PowerShell Execution Script

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "Starting NexaDS Platform (FastAPI Backend + React Frontend)" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Python
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Error "Python 3.10+ is required but not found in PATH. Install from https://www.python.org"
    exit 1
}

# 2. Check Node
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Error "Node.js 18+ is required but not found in PATH. Install from https://nodejs.org"
    exit 1
}

# 3. Setup Virtual Environment if not exists
if (-not (Test-Path "venv")) {
    Write-Host "Creating Python virtual environment (venv)..." -ForegroundColor Yellow
    python -m venv venv
}

Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1

Write-Host "[1/3] Installing Python dependencies..." -ForegroundColor Green
python -m pip install -r requirements.txt

Write-Host "[2/3] Installing Node.js frontend packages..." -ForegroundColor Green
npm install

Write-Host "[3/3] Launching Full-Stack Application..." -ForegroundColor Green
Write-Host "Open your browser at: http://localhost:3000" -ForegroundColor Cyan
npm run dev
