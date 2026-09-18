# Horilux web (admin platform)

React 19 + TypeScript + Vite single-page app for Horilux Estates staff. It talks to the Django API in `../Horilux/`.

## Setup

```bash
cp .env.example .env.local      # set VITE_API_BASE_URL, e.g. http://localhost:8000/api/v1
npm install
npm run dev                     # http://localhost:5173 (5174 also allowed by dev CORS)
```

`VITE_API_BASE_URL` must include `/api/v1` and have no trailing slash. It is the only environment variable.

| Script | What it does |
|---|---|
| `npm run dev` | Dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) and production build to `dist/` |
| `npm run lint` | oxlint |
| `npm run preview` | Serve the production build locally (port 4173) |

Deploys to Vercel as a static SPA (`vercel.json` rewrites every path to `index.html`).

## Layout

```
src/
  App.tsx                 routes (lazy-loaded pages, permission gates, legacy /ceo/* redirects)
  lib/                    api client (JWT + refresh), query client, formatting, toasts
  hooks/                  URL-synced filters, debounced search, document title
  components/ui/          design-system primitives (Button, Field, Panel, Table, Dialog, Drawer, charts…)
  components/domain/      status badges and record pickers shared across features
  components/layout/      app shell: sidebar, top bar, command palette (Ctrl/⌘ K), notifications
  config/navigation.ts    sidebar items and the permissions that reveal them
  features/<area>/        api.ts (types + React Query hooks) and its pages
```

## Conventions

- **Permissions** — `features/accounts/permissions.ts` mirrors the backend RBAC matrix (`Horilux/accounts/rbac_matrix.py`). It only decides what the UI shows; the API enforces everything. Update both together.
- **Data** — every request goes through a React Query hook in the feature's `api.ts`. Mutations invalidate their list keys and `["reports"]` so dashboards stay current.
- **Filters and pagination live in the URL** (`useUrlState`), so views can be shared and survive reloads.
- **Errors** — use `getErrorMessage(err)` for toasts and `getFieldErrors(err)` for inline form errors; both understand DRF's error shapes.
- **Design tokens** are in `tailwind.config.js` (brand midnight `#240270`, forest `#003E03`, kokoda `#7A6D0C`, Manrope). Use the tokens (`text-ink`, `bg-surface`, `border-line`, `text-brand`…) rather than raw hex values. Chart colours are in `components/ui/charts.tsx`; they were checked for colour-blind separation and contrast.
- Money is Ghana cedis by default: `formatMoney(value, currency)`.

## Test accounts (local seed data only)

With the backend seeded (`seed_rbac`, `seed_test_users`), each role has a login: `ceo@`, `listing@`, `sales@`, `marketing@`, `finance@` and `operations@horilux.test`, all with password `TestPass123!`. Never seed these in production.
