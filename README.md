# Personal Finance Manager

A full-stack personal finance application for recording income and expenses and reviewing a monthly balance. The current implementation combines a React and TypeScript frontend with a FastAPI REST API, PostgreSQL persistence, JWT authentication, and per-user data isolation.

## Implemented features

- User registration and login with Argon2 password hashing and JWT access tokens
- Authenticated session restoration in the frontend
- Per-user accounts, categories, and transactions
- Create income and expense transactions with validated account/category ownership
- Current-month balance, income, and expense summary
- Recent transaction history with Polish locale formatting
- Default accounts and categories created for each new user
- PostgreSQL schema migrations with Alembic
- Interactive API documentation through FastAPI
- Docker Compose setup for frontend, API, and database
- Automated tests for financial summaries and authentication security helpers

## Tech stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| API | Python, FastAPI, Pydantic |
| Data | PostgreSQL, SQLAlchemy, Alembic |
| Security | JWT, Argon2 |
| Environment | Docker Compose |

## Architecture

```text
frontend/
  src/
    api/          # Typed authentication and transaction requests
    components/   # Authentication UI
    App.tsx       # Authenticated finance dashboard
backend/
  app/
    api/          # REST routes and authentication dependencies
    core/         # Configuration and security helpers
    db/           # Database session and model registration
    models/       # SQLAlchemy entities
    repositories/ # Data access for transactions and references
    schemas/      # Pydantic request and response models
    services/     # Financial summary logic
  alembic/        # Database migrations
  tests/          # Summary and security tests
```

The API validates resource ownership before accepting transactions. Monetary values use PostgreSQL `NUMERIC(14,2)` rather than floating-point storage, and transfers are excluded from income/expense summaries.

## Run with Docker

Requirements: Docker with Docker Compose.

```bash
git clone https://github.com/WielechJW/personal-finance-manager.git
cd personal-finance-manager
cp .env.example .env
docker compose up --build
```

Before the first start, replace the example database password in `.env`.

- Frontend: [http://localhost:5173](http://localhost:5173)
- API documentation: [http://localhost:8000/docs](http://localhost:8000/docs)
- Health check: [http://localhost:8000/api/v1/health](http://localhost:8000/api/v1/health)

## Run backend tests

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest
```

On Windows PowerShell, activate the environment with `.venv\Scripts\Activate.ps1`.

## Current scope and roadmap

The public code currently supports registration, login, account/category creation, transaction creation and listing, and monthly summaries. Editing and deleting transactions, budgets, charts, CSV/Excel import/export, refresh tokens, and recurring reports are planned but not implemented yet.

Keeping planned work separate from delivered functionality makes the repository an accurate snapshot of the application today.

