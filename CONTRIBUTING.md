# Contributing to 24TRADEX

## Development Setup

### Prerequisites
- Node.js 24+ or latest LTS
- Python 3.11+
- pnpm (for Node packages)
- pipenv or venv (for Python)

### Initial Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/24tradex.git
   cd 24tradex
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   cd backend/tradex && pipenv install --python 3.11 -r requirements.txt && cd ../..
   ```

3. **Set up environment:**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env and set DEBUG=True for development
   ```

4. **Run migrations:**
   ```bash
   cd backend/tradex
   python manage.py migrate
   python manage.py createsuperuser
   cd ../..
   ```

5. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend/tradex
   python manage.py runserver

   # Terminal 2: Frontend (new terminal)
   cd frontend
   pnpm run dev
   ```

## Development Workflow

### Before Committing

1. **Type check:**
   ```bash
   pnpm run typecheck
   ```

2. **Format code:**
   ```bash
   pnpm run format
   ```

3. **Build frontend:**
   ```bash
   cd frontend && pnpm run build && cd ..
   ```

4. **Run tests (when added):**
   ```bash
   cd backend/tradex
   python manage.py test
   cd ../..
   ```

### Branching Strategy

- `main` - Production-ready code
- `develop` - Development branch (default)
- `feature/...` - Feature branches
- `bugfix/...` - Bug fix branches
- `hotfix/...` - Urgent production fixes

### Commit Messages

Follow conventional commits:
```
feat: add new feature
fix: fix bug
docs: update documentation
style: format code
refactor: refactor code
test: add tests
chore: update dependencies
```

## Code Style

### Python
- Follow PEP 8
- Use type hints where possible
- Max line length: 100 characters
- Use Django's ORM (avoid raw SQL)

### TypeScript/React
- Use strict TypeScript (`tsconfig.json`)
- Follow ESLint rules
- Use functional components with hooks
- Component names in PascalCase
- File names in kebab-case (except components)
- Max line length: 100 characters

### Testing

#### Backend
```bash
cd backend/tradex

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test apps.purchases

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
```

#### Frontend
```bash
cd frontend

# Run tests (when configured)
npm run test
```

## Project Structure

```
24tradex/
├── backend/tradex/              # Django backend
│   ├── apps/
│   │   ├── accounts/            # User management
│   │   ├── purchases/           # Purchase/token logic
│   │   ├── withdrawals/         # Withdrawal logic
│   │   ├── sponsor/             # Referral system
│   │   ├── transactions/        # Transaction tracking
│   │   ├── notifications/       # Email notifications
│   │   ├── admin_dashboard/     # Admin interface
│   │   ├── settings_app/        # System settings
│   │   └── ...
│   ├── tradex/                  # Project settings
│   ├── templates/               # Django templates
│   ├── static/                  # Static files
│   ├── media/                   # User uploads
│   ├── manage.py                # Django CLI
│   └── db.sqlite3               # Development database
│
├── frontend/                    # React + Vite
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   ├── pages/               # Route pages
│   │   ├── hooks/               # Custom hooks
│   │   ├── lib/                 # Utilities
│   │   ├── App.tsx              # Root component
│   │   └── main.tsx             # Entry point
│   ├── public/                  # Public assets
│   ├── package.json
│   └── vite.config.ts
│
├── lib/                         # Shared libraries
│   ├── api-spec/                # OpenAPI spec
│   ├── api-client-react/        # Generated API hooks
│   ├── api-zod/                 # Generated Zod schemas
│   └── db/                      # Database schemas
│
├── scripts/                     # Utility scripts
├── docs/                        # Documentation
├── README.md
├── DEPLOYMENT.md
└── .gitignore
```

## Key Technologies

### Backend Stack
- **Django 5.0+** - Web framework
- **Django REST Framework** - API
- **Django CORS Headers** - CORS support
- **Pillow** - Image processing
- **PyJWT** - JWT authentication
- **python-dotenv** - Environment variables

### Frontend Stack
- **React 18+** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **React Hook Form** - Form management
- **TanStack Query** - Data fetching
- **Zod** - Schema validation
- **Wouter** - Routing

## Common Tasks

### Adding a New Model

1. Create in `apps/myapp/models.py`
2. Register in `apps/myapp/admin.py`
3. Create serializer in `apps/myapp/serializers.py`
4. Create viewset in `apps/myapp/views.py`
5. Register in `apps/myapp/urls.py`
6. Create migration: `python manage.py makemigrations`
7. Apply migration: `python manage.py migrate`

### Adding an API Endpoint

1. Create serializer
2. Create viewset with appropriate methods
3. Register in URL router
4. Update OpenAPI spec (`lib/api-spec/openapi.yaml`)
5. Run code generation: `pnpm --filter api-spec run codegen`
6. Use generated hooks in React

### Adding a New Page

1. Create component in `frontend/src/pages/`
2. Add route in `frontend/src/App.tsx`
3. Import API hooks from `@workspace/api-client-react`
4. Use TypeScript types from `@workspace/api-zod`

### Updating Dependencies

```bash
# Check outdated packages
pnpm outdated

# Update all packages
pnpm up --latest

# Update specific package
pnpm add package@latest

# Backend
cd backend/tradex
pip list --outdated
pip install --upgrade package
pip freeze > requirements.txt
```

## Debugging

### Backend
```bash
# Debug with prints
print(f"Debug: {variable}")

# Django shell
python manage.py shell

# SQL query logging
# Add to settings.py:
# LOGGING = {
#     'version': 1,
#     'handlers': {
#         'console': {'class': 'logging.StreamHandler'},
#     },
#     'loggers': {
#         'django.db.backends': {
#             'handlers': ['console'],
#             'level': 'DEBUG',
#         },
#     },
# }

# Breakpoint debugging
import pdb; pdb.set_trace()
```

### Frontend
```bash
# Browser DevTools
# - F12 to open DevTools
# - Network tab for API calls
# - Console for errors
# - React DevTools extension

# React Query DevTools (development)
# Already included in code

# VS Code Debugger
# Add to .vscode/launch.json:
# {
#   "version": "0.2.0",
#   "configurations": [
#     {
#       "type": "chrome",
#       "request": "launch",
#       "name": "Launch Chrome",
#       "url": "http://localhost:5173",
#       "webRoot": "${workspaceFolder}/frontend/src"
#     }
#   ]
# }
```

## Performance Tips

### Backend
- Use `select_related()` for foreign keys
- Use `prefetch_related()` for many-to-many
- Add database indexes for common queries
- Cache expensive operations
- Use pagination for large querysets

### Frontend
- Use React.memo() for expensive components
- Implement code splitting with React.lazy()
- Optimize images (WebP format)
- Minimize bundle size
- Use TanStack Query caching

## Security Guidelines

1. **Never commit secrets:**
   - Passwords
   - API keys
   - Private keys
   - Database credentials

2. **Use environment variables for:**
   - SECRET_KEY
   - DEBUG flag
   - Database URLs
   - Email credentials
   - API keys

3. **Validate all user input:**
   - Backend: Use serializer validation
   - Frontend: Use form validation + Zod

4. **Protect sensitive endpoints:**
   - Require authentication
   - Use permission classes
   - Rate limit if needed

## Reporting Issues

1. Check if issue already exists
2. Use descriptive title
3. Include:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Environment (OS, browser, versions)
   - Error messages/screenshots

## Pull Request Process

1. Create feature branch from `develop`
2. Commit with clear messages
3. Push branch and create PR
4. Ensure all checks pass (type check, build)
5. Request review
6. Address feedback
7. Merge to `develop` when approved
8. Periodically merge `develop` → `main`

## Questions?

- Check documentation in `/docs/`
- Review existing code for patterns
- Check Django/React official docs
- Ask in issues/discussions

Thank you for contributing! 🎉
