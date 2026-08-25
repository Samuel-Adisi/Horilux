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
| Admin Frontend | React (Vite) + TypeScript |
| Public Website | Next.js |
| Media/Documents | S3-compatible object storage |
| Notifications | Email (in-app first; WhatsApp/SMS post-MVP) |

---

## Project Structure

```
horilux/
├── accounts/       # Users, Roles, Permissions, Departments, RBAC engine
├── properties/     # Properties, Owners, Media, Documents, Verification
├── crm/            # Leads, Clients, Pipeline, Notes
├── viewings/       # Viewings, Follow-ups, Outcomes
├── transactions/   # Transactions, Payments, Commissions
├── marketing/       # Campaigns, Content, Publishing, Performance
├── operations/       # Tasks, Staff records, Scheduling
├── notifications/     # In-app, email, (future WhatsApp/SMS)
├── audit/               # Audit log middleware + models
├── reporting/             # Aggregation/reporting endpoints, CEO dashboard KPIs
├── workflow/                # Central state-machine engine
└── api/                        # DRF routers, serializers, permission classes
```

```
frontend/
├── admin/          # React (Vite) admin platform — role-gated dashboards
└── public/         # Next.js public website
```

---

## Prerequisites

- Python 3.12+
- Node.js 20+
- PostgreSQL (or a Neon project + connection string)
- Redis
- `pip`, `npm`

---

## Setup

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd horilux-estates
cp .env.example .env
```

Fill in `.env`:

```
DATABASE_URL=postgresql://<user>:<password>@<neon-host>/<db>
SECRET_KEY=
DEBUG=True
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=
STORAGE_BUCKET=
EMAIL_HOST=
EMAIL_HOST_USER=
EMAIL_HOST_PASSWORD=
```

### 2. Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt

python manage.py migrate
python manage.py createsuperuser
python manage.py loaddata seed/roles_permissions.json   # seeds RBAC roles

python manage.py runserver
```

Start Celery (separate terminal):

```bash
celery -A horilux worker -l info
celery -A horilux beat -l info      # scheduled tasks (overdue follow-ups, etc.)
```

### 3. Admin frontend

```bash
cd frontend/admin
npm install
npm run dev
```

### 4. Public website

```bash
cd frontend/public
npm install
npm run dev
```

---

## Running Tests

```bash
# Backend
cd backend
python manage.py test

# Frontend
cd frontend/admin
npm run test
```

Permission/RBAC tests live in `accounts/tests/` — run these first after any change to roles or permission classes.

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
