# 24TradeX

A premium crypto token trading platform inspired by Binance/Bybit — dark, futuristic, and feature-complete.

## Run & Operate

- Frontend (React + Vite): managed by `artifacts/24tradex: web` workflow
- Backend (Django): managed by `artifacts/api-server: API Server` workflow
- Django dev server: `bash /home/runner/workspace/backend/start.sh`
- Django migrations: `cd backend/tradex && python manage.py migrate`
- Django superuser: username `admin`, password `admin123`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui, TanStack Query
- **Backend:** Python 3.11, Django 5.2, Django REST Framework, SQLite
- **Auth:** JWT (PyJWT) — stored in localStorage as `24tradex_token`
- API codegen: Orval (from OpenAPI spec)

## Where things live

- Frontend: `artifacts/24tradex/src/`
- Django backend: `backend/tradex/`
- Django apps: `backend/tradex/apps/` (accounts, purchases, withdrawals, sponsor, notifications, settings_app, dashboard, admin_api, transactions)
- OpenAPI spec: `lib/api-spec/openapi.yaml`
- Generated hooks: `lib/api-client-react/src/generated/`
- SQLite DB: `backend/tradex/db.sqlite3`

## Architecture decisions

- Django serves at `/api` path, replacing the default Express server
- JWT tokens stored client-side in localStorage, attached via custom-fetch.ts
- Sponsor codes auto-generated as `24TX-XXXXXX` on user creation
- Token unlock uses 3-stage time-based logic stored as backend datetime (survives logout)
- Admin approval triggers sponsor earnings calculation automatically

## Product

24TradeX is a crypto token trading platform where users can:
- Register with a sponsor code / sponsor link
- Submit token purchase requests (USDT BEP20) with TXID proof
- View time-locked token unlock progress (72h → 50%, 24h → 25%, 24h → 25%)
- Submit withdrawal requests once tokens unlock
- Earn sponsor commissions when their referred users make purchases
- Admins can approve/reject purchases & withdrawals, manage users, edit system settings

## User preferences

- Backend MUST be Django (Python) — never Express/Node.js
- Never use the word "Investment" — use Purchase, Sale, Trading, Token Purchase instead
- Dark futuristic theme always (never light mode)
- Premium UI inspired by Binance/Bybit

## Gotchas

- Django uses SQLite for dev (not Drizzle/PostgreSQL)
- Always run `cd backend/tradex && python manage.py makemigrations && python manage.py migrate` after model changes
- The `api-server` artifact now runs Django, not Express
- Frontend API base URL is `/api` (relative, via custom-fetch.ts)
- After codegen changes, restart the frontend workflow

## Pointers

- See `pnpm-workspace` skill for workspace structure
- Django admin panel at `/django-admin/` (username: admin, password: admin123)
