# Setup Script for 24TradeX Development Environment (Windows)
# This script sets up the Node.js monorepo and Python backend for local development.

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "24TradeX Development Environment Setup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Step 1: Install Node dependencies
Write-Host "`n[1/4] Installing Node.js dependencies with pnpm..." -ForegroundColor Yellow
pnpm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: pnpm install failed. Ensure pnpm is installed: npm install -g pnpm" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node dependencies installed" -ForegroundColor Green

# Step 2: Set up Python virtual environment with pipenv
Write-Host "`n[2/4] Setting up Python environment with pipenv..." -ForegroundColor Yellow
pipenv install --python 3.11 -r backend/requirements.txt
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: pipenv install failed. Ensure pipenv is installed: pip install pipenv" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Python environment configured" -ForegroundColor Green

# Step 3: Run Django migrations
Write-Host "`n[3/4] Running Django migrations..." -ForegroundColor Yellow
$env:PYTHONPATH = "$PWD\backend\tradex"
pipenv run python backend/tradex/manage.py migrate
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Django migrations failed" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Django migrations applied" -ForegroundColor Green

# Step 4: Summary and next steps
Write-Host "`n[4/4] Setup complete!" -ForegroundColor Green
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "
1. Start the Django backend:
   cd backend\tradex
   pipenv run python manage.py runserver

2. In a new terminal, start the React frontend:
   cd artifacts\24tradex
   pnpm run dev

3. Django admin panel:
   URL: http://localhost:8000/admin
   Username: admin
   Password: admin123

4. Frontend:
   URL: http://localhost:5173 (or whatever Vite outputs)

5. API base URL: http://localhost:8000/api
" -ForegroundColor Cyan
