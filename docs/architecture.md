# Horilux Estates — Project Architecture V1.0
**Real Estate Operating System — Public Website + Internal Business Management Platform**

Based on: *Developer Project & Requirements Specification V1.0* + *Brand Style Guidelines*

---

## 1. Architecture Philosophy

Per the spec: **the database is the single source of truth**, **workflow controls how work moves**, and **RBAC controls who can see and do what**. Frontend button-hiding is explicitly called out as *not* security — so this architecture enforces every permission at the API layer, never in the client.

Two consumers, one backend:
- **Public Website** — buyers, tenants, owners, visitors (read-heavy, SEO-critical, public)
- **Admin Platform** — CEO, Listing, Sales, Marketing, Finance, Operations (internal, permission-gated, workflow-driven)

Both talk to a single Backend/API. No business logic lives in either frontend.

---

## 2. High-Level System Diagram

```
                        ┌─────────────────────┐
                        │   Public Website     │  Next.js/React (SSR/SSG)
                        │  (SEO, search, leads) │
                        └──────────┬───────────┘
                                   │ HTTPS/REST
┌─────────────────────┐           │           ┌─────────────────────┐
│   Admin Platform     │──────────┼───────────│   Mobile (Post-MVP)  │
│  React SPA (RBAC UI) │          │           │  React Native (future)│
└──────────┬───────────┘          │           └─────────────────────┘
           │                      │
           └──────────┬───────────┘
                       ▼
          ┌─────────────────────────────┐
          │   Backend / API Layer        │  Django + Django REST Framework
          │  Auth · RBAC · Business Logic│
          │  Workflow Engine · Audit Log │
          └───────────┬─────────────────┘
                       │
       ┌───────────────┼────────────────┬─────────────────┐
       ▼               ▼                ▼                  ▼
┌─────────────┐ ┌─────────────┐ ┌───────────────┐ ┌─────────────────┐
│ PostgreSQL   │ │ Redis +     │ │ Object Storage │ │ Notification     │
│ (Neon)       │ │ Celery      │ │ (S3-compatible)│ │ Service           │
│ source of    │ │ (tasks,     │ │ media/docs     │ │ (email/in-app,    │
│ truth        │ │ notifications)│ │               │ │ WhatsApp/SMS later)│
└─────────────┘ └─────────────┘ └───────────────┘ └─────────────────┘
```

---

## 3. Proposed Technology Stack

| Layer | Technology | Rationale |
|---|---|---|
| Backend/API | **Django + Django REST Framework** | Batteries-included auth, admin, ORM; DRF gives clean permission classes per action (View/Create/Edit/Delete/Assign/Approve/Publish/Export) mapping directly to the RBAC matrix required in the spec |
| Database | **PostgreSQL (Neon)** | Relational integrity for normalized entities (Properties, Leads, Transactions etc.); Neon gives branching for safe schema migrations during Phase 1–3 |
| Auth | Django auth + **JWT (SimpleJWT)** | Stateless auth for SPA/mobile clients, refresh-token rotation, session invalidation support |
| Task Queue / Automation | **Celery + Redis** | Powers the "system must tell employees what to do next" requirement — task creation on state transitions, overdue follow-up alerts, notification dispatch |
| Admin Frontend | **React (Vite) + TypeScript** | Role-specific dashboards, permission-aware component rendering (UI hides but API still enforces) |
| Public Website | **Next.js (React)** | SSR/SSG for property listing SEO — critical for a "front door / customer acquisition layer" as the spec frames it |
| Media/Documents | **S3-compatible object storage** (e.g. Cloudflare R2 / AWS S3) | Property photos, videos, verification documents — decoupled from DB, versioned, access-controlled |
| Notifications | Django signals → Celery tasks → **Email (SES/SendGrid)** + in-app; WhatsApp/SMS as pluggable provider later | Matches spec's phased approach: "start with in-app and email" |
| Search | Postgres full-text + trigram (pg_trgm) initially; **Meilisearch/Elasticsearch** if property volume grows | Avoids premature infra cost for MVP |
| Hosting/Infra | Containerized (Docker) on a managed platform (e.g. Railway/Render/Fly.io or Ghana-friendly VPS) | Horilux retains account ownership per spec §21 |
| Monitoring | Sentry (errors) + basic uptime monitoring | Required for Phase 10 launch deliverables |

*(Your Go/hostmond PaaS could serve as the deployment target if you want to self-host rather than use a third-party PaaS — worth deciding before Phase 3.)*

---

## 4. Core Django App Structure (mirrors data ownership in spec §5)

```
horilux/
├── accounts/          # Users, Roles, Permissions, Departments, RBAC engine
├── properties/         # Properties, Owners, Media, Documents, Verification
├── crm/                 # Leads, Clients, Pipeline, Notes
├── viewings/            # Viewings, Follow-ups, Outcomes
├── transactions/        # Transactions, Payments, Commissions
├── marketing/            # Campaigns, Content, Publishing, Performance
├── operations/           # Tasks, Staff records, Scheduling
├── notifications/         # In-app, email, (future WhatsApp/SMS)
├── audit/                  # Audit log middleware + models
├── reporting/               # Aggregation/reporting endpoints, CEO dashboard KPIs
├── workflow/                  # Central state-machine engine (see §5)
└── api/                         # DRF routers, serializers, permission classes
```

Each app owns its models per the spec's data-ownership table — Listing owns Property/Owner/Documents, Sales owns Lead/Client/Viewing, etc. — but all reads/writes go through the shared `workflow` and `accounts` (RBAC) apps so state transitions and permission checks are never duplicated per-app.

---

## 5. RBAC Design

**Model:** `Role` ←→ `Permission` (action × resource × scope), `User` ←→ `Role` (+ optional `Department`).

- **Actions:** View, Create, Edit, Delete, Assign, Approve, Publish, Export
- **Scopes:** Own, Assigned, Team, Department, Company
- **Enforcement:** Custom DRF `permission_classes` resolve `(user, action, resource, scope)` on every request — implemented once, reused everywhere. No route is ever "just protected by hiding the button."
- Recommend a `django-guardian`-style object-level permission layer, or a hand-rolled scope resolver, since Django's default auth groups don't natively support scope (Own/Assigned/Team/Department/Company).

---

## 6. Workflow Engine (state machines)

Given three parallel workflows (Property, Client/Lead, Transaction) each with fixed statuses and manager-approval gates, model these as explicit **finite state machines** (e.g. `django-fsm` or a custom `WorkflowState` model) rather than free-text status fields:

- Each transition is a guarded function: checks RBAC (`Approve` action), validates required fields (e.g. verification checklist complete before "Verified"), and **fires a Celery task** (e.g. property approved → create marketing task; lead created → create sales response task).
- The audit log hooks into transition signals automatically — every state change is logged with actor, old value, new value, timestamp for free.

---

## 7. Database — Core Entity Relationships (ERD summary)

```
User ──< UserRole >── Role ──< RolePermission >── Permission
User ──< Department

Property ──> Owner
Property ──< PropertyMedia
Property ──< PropertyDocument
Property ──< VerificationChecklist
Property ──< Task (via generic FK)

Lead ──> assigned Agent(User)
Lead ──> Client (on qualification)
Client ──< Viewing >── Property
Viewing ──< FollowUp

Transaction ──> Property, Client, Owner, Agent(User)
Transaction ──< Payment
Transaction ──< Commission

MarketingCampaign ──< Property (approved only)
Task ──> owner(User), related_object(generic FK), due_date, status
Notification ──> recipient(User), related_object(generic FK)
AuditLog ──> actor(User), action, old_value, new_value, timestamp
```

A full ERD (diagram form) should be produced as a Phase 1 deliverable — this is the text summary to validate scope before drawing it.

---

## 8. API Structure (high level)

```
/api/v1/auth/            login, refresh, logout
/api/v1/users/           CRUD (CEO/Admin only, RBAC-gated)
/api/v1/roles/           RBAC matrix management
/api/v1/properties/      list, detail, verify, approve, publish
/api/v1/leads/           list, assign, qualify, convert-to-client
/api/v1/clients/         profile, history
/api/v1/viewings/        schedule, complete, outcome
/api/v1/transactions/    stages, payments, commissions
/api/v1/marketing/       campaigns, content, publish, analytics
/api/v1/tasks/           list, complete, overdue
/api/v1/notifications/   list, mark-read
/api/v1/reports/         property, sales, marketing, finance, staff
/api/v1/dashboard/ceo/   aggregated KPIs
/api/v1/public/          unauthenticated: search, property detail, enquiry, schedule-viewing
```

Public endpoints are a deliberately narrow, cached, read-mostly surface — enquiries/viewing-requests are the only writes, and they funnel straight into `crm.Lead` creation (spec §12).

---

## 9. Deployment & Environments

- **Dev → Staging → Production**, each with its own Neon Postgres branch (cheap, instant branching fits the iterative Phase 1–9 build).
- CI runs migrations + tests on PR; staging auto-deploys from `main`; production deploys are manual/tagged releases with a rollback plan.
- Backups: automated daily Postgres snapshots + object storage versioning, per spec §14/§17.
- Horilux retains ownership of domain, hosting, and production accounts (spec §21) — developer gets scoped access, not sole ownership.

---

## 10. Mapping to Spec's Development Phases

| Phase | This architecture delivers |
|---|---|
| 1. Discovery & Architecture | This document + ERD + RBAC matrix + workflow diagrams |
| 2. Design | Frontend design system (Manrope, Midnight Blue #240270, Forest Green, Kokoda) applied to wireframes |
| 3. Backend Foundation | `accounts`, `audit`, `workflow` apps + JWT auth |
| 4. Property | `properties` app + verification state machine |
| 5. CRM | `crm`, `viewings` apps |
| 6. Transactions & Finance | `transactions` app |
| 7. Marketing | `marketing` app (consumes only "Published"-eligible properties) |
| 8. Reports & Automation | `reporting`, `notifications`, Celery task rules |
| 9. Testing | Per-role permission test matrix + functional/security/performance suites |
| 10. Launch | Prod deploy, SSL, backups, monitoring, staff onboarding |

---

## 11. Open Decisions to Confirm With Horilux Before Coding

1. Hosting target: managed PaaS vs. self-hosted (your `hostmond` Go PaaS is a candidate)
2. Search: Postgres FTS vs. dedicated search engine at launch
3. WhatsApp/SMS provider (post-MVP) — Twilio vs. local Ghana provider
4. Multi-branch/multi-tenant support — needed at MVP or truly post-MVP as spec states?
5. Exact commission-calculation rules (splits, tiers) — not detailed in spec, needed for `transactions` app logic

---

*Prepared as a Phase 1 architecture deliverable for Horilux Estates, per Developer Requirements V1.0 §17.*
