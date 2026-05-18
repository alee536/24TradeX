#!/bin/bash
# Setup Script for 24TradeX Development Environment (Unix/Linux/macOS)
# This script sets up the Node.js monorepo and Python backend for local development.

set -e  # Exit on error

echo "========================================"
echo "24TradeX Development Environment Setup"
echo "========================================"

# Step 1: Install Node dependencies
echo ""
echo "[1/4] Installing Node.js dependencies with pnpm..."
pnpm install
echo "✓ Node dependencies installed"

# Step 2: Set up Python virtual environment with pipenv
echo ""
echo "[2/4] Setting up Python environment with pipenv..."
pipenv install --python 3.11 -r backend/requirements.txt
echo "✓ Python environment configured"

# Step 3: Run Django migrations
echo ""
echo "[3/4] Running Django migrations..."
export PYTHONPATH="$PWD/backend/tradex"
pipenv run python backend/tradex/manage.py migrate
echo "✓ Django migrations applied"

# Step 4: Summary and next steps
echo ""
echo "[4/4] Setup complete!"
echo ""
echo "========================================"
echo "Next Steps:"
echo "========================================"
echo ""
echo "1. Start the Django backend:"
echo "   cd backend/tradex"
echo "   pipenv run python manage.py runserver"
echo ""
echo "2. In a new terminal, start the React frontend:"
echo "   cd artifacts/24tradex"
echo "   pnpm run dev"
echo ""
echo "3. Django admin panel:"
echo "   URL: http://localhost:8000/admin"
echo "   Username: admin"
echo "   Password: admin123"
echo ""
echo "4. Frontend:"
echo "   URL: http://localhost:5173 (or whatever Vite outputs)"
echo ""
echo "5. API base URL: http://localhost:8000/api"
echo ""
