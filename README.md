# Horilux Estates

Real Estate Operating System — public property website + internal admin/business management platform for Horilux Estates.

Full architecture, RBAC design, and workflow decisions: [`docs/architecture.md`](docs/architecture.md)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend / API | Django + Django REST Framework |
| Database | PostgreSQL (Neon) |
| Auth | JWT (SimpleJWT) |
| Task Queue | Celery + Redis |
| Admin Frontend | React 19 (Vite) + TypeScript, TanStack Query, Tailwind |
| Public Website | Next.js (not started) |
| Media/Documents | S3-compatible object storage |
| Notifications | Email (in-app first; WhatsApp/SMS post-MVP) |

---

## Project Structure

The live code is in two directories:

```
Horilux/                 # Django project (run everything from here)
├── Horilux/             # settings (dev / staging / production), urls, wsgi, celery
├── accounts/            # users, roles, departments, RBAC engine (rbac_matrix.py)
├── properties/          # properties, owners, media, documents, verification
├── crm/                 # leads, clients, interactions
├── viewings/            # viewings, follow-ups
├── transactions/        # transactions, payments, commissions, approval threshold
├── marketing/           # campaigns, performance
├── operations/          # tasks
├── notifications/       # in-app notifications + preferences
├── audit/               # audit log (actor recorded via middleware)
├── company/             # company profile, integrations
└── reporting/           # department reports, CEO dashboard, board pack PDF

web/                     # React (Vite) admin platform — see web/README.md
```

The top-level `accounts/`, `crm/`, … directories, the root `manage.py`, and `features/` are an
older copy of the project and are not used. The public Next.js site hasn't been built yet.

---

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL (or a Neon project + connection string)
- Redis (only for Celery beat tasks)

---

## Setup

### 1. Backend

```bash
cd Horilux
cp .env.example .env           # fill in DATABASE_URL, SECRET_KEY, CLOUDINARY_*
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

python manage.py migrate       # also syncs the RBAC matrix
python manage.py seed_rbac
python manage.py seed_commission_rules
python manage.py seed_company_settings
python manage.py createsuperuser
python manage.py runserver
```

Optional local demo data: `seed_test_users` (one login per role, password `TestPass123!`),
`seed_sales_pipeline_demo`, `seed_transactions_demo`, `seed_finance_demo`, `seed_approvals_demo`.

Celery (overdue follow-up sweeps):

```bash
celery -A Horilux worker -l info
celery -A Horilux beat -l info
```

### 2. Admin frontend

```bash
cd web
cp .env.example .env.local     # VITE_API_BASE_URL=http://localhost:8000/api/v1
npm install
npm run dev
```

---

## Running Tests

```bash
cd Horilux && pytest           # backend
cd web && npm run build && npm run lint   # frontend type-check, build and lint
```

Permission/RBAC tests live in `Horilux/tests/accounts/` — run these first after any change to roles or permission classes.

---

## Key Concepts

- **RBAC is enforced at the API layer only.** Frontend hides UI for convenience; every action (View/Create/Edit/Delete/Assign/Approve/Publish/Export) is checked server-side. Never rely on UI state for security.
- **Workflows are state machines**, not free-text status fields. Property, Lead, and Transaction all move through fixed, guarded transitions — see `workflow/` app.
- **Every state transition is audited** automatically via signals — actor, old value, new value, timestamp.

---

## Deployment

- Environments: `dev` → `staging` → `production`, each on its own Neon Postgres branch.
- CI runs migrations + full test suite on every PR.
- Staging auto-deploys from `main`; production deploys are tagged releases.
- Production accounts (domain, hosting, database) are owned by Horilux Estates; developer access is scoped, not sole ownership.

---

## Documentation

- [`docs/architecture.md`](docs/architecture.md) — full system architecture, ERD, RBAC design, phase mapping
- [`docs/rbac-matrix.md`](docs/rbac-matrix.md) — permission matrix per role *(add once generated)*
- [`docs/erd.png`](docs/erd.png) — entity relationship diagram *(add once generated)*

---

## Status

Pre-development / early build. See `docs/architecture.md` §10 for phase-by-phase progress mapping.
