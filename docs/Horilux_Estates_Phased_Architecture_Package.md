# Horilux Estates — Complete Architecture Package
**Organized by Development Phase, per Developer Requirements V1.0 §17–§18**

This document expands the high-level architecture into the full set of pre-development deliverables the spec requires, organized in build order. Each phase lists exactly what's decided, what's still open, and what needs Horilux sign-off before moving to the next.

---

## PHASE 1 — Discovery & Architecture

### 1.1 System Architecture
*(See standalone `architecture.md` for full diagram + stack rationale — summarized here)*

- Backend: Django + DRF · DB: PostgreSQL (Neon) · Queue: Celery + Redis
- Admin: React (Vite) SPA · Public: Next.js
- Storage: S3-compatible · Auth: JWT

### 1.2 Complete ERD (ready to diagram)

**Entities and fields:**

**User**
- id, email, phone, password_hash, first_name, last_name, is_active, department_id (FK), date_joined, last_login

**Department**
- id, name (Listing / Sales / Marketing / Transactions / Operations / CEO), description

**Role**
- id, name (CEO, Listing Agent, Sales Agent, Marketing, Finance, Operations), description

**UserRole** (join)
- id, user_id (FK), role_id (FK)

**Permission**
- id, action (View/Create/Edit/Delete/Assign/Approve/Publish/Export), resource (Property/Lead/Transaction/etc.), scope (Own/Assigned/Team/Department/Company)

**RolePermission** (join)
- id, role_id (FK), permission_id (FK)

**PropertyOwner**
- id, name, phone, email, id_document, address, notes

**Property**
- id, title, type (residential/commercial), listing_type (sale/rent), price, currency, location, address, bedrooms, bathrooms, land_size, building_size, amenities (JSON/array), description, owner_id (FK), agent_id (FK→User), status (enum, see 1.4), completion_percent, created_at, updated_at

**PropertyMedia**
- id, property_id (FK), file_url, type (photo/video), order, uploaded_by (FK)

**PropertyDocument**
- id, property_id (FK), file_url, doc_type, uploaded_by (FK), verified (bool)

**VerificationChecklist**
- id, property_id (FK), owner_info_ok, price_ok, location_ok, details_ok, photos_ok, documents_ok, commission_agreement_ok, manager_approved, approved_by (FK), approved_at

**Lead**
- id, name, phone, email, source, budget, currency, location_preference, property_type_preference, bedrooms_preference, purpose, assigned_agent_id (FK), status (enum, see 1.4), last_contact, next_follow_up, notes, created_at

**Client** *(created on lead qualification)*
- id, lead_id (FK, nullable), name, phone, email, preferences (JSON), budget, assigned_agent_id (FK), created_at

**Viewing**
- id, client_id (FK), property_id (FK), agent_id (FK), date, time, status (enum), notes, outcome (Hot/Warm/Cold), next_action

**FollowUp**
- id, viewing_id (FK, nullable), lead_id (FK, nullable), client_id (FK, nullable), due_date, completed, notes, responsible_agent_id (FK)

**Transaction**
- id, property_id (FK), client_id (FK), owner_id (FK), agent_id (FK), price, commission_percent, expected_commission, amount_received, outstanding_amount, status (enum, see 1.4), created_at

**Payment**
- id, transaction_id (FK), amount, date, status (Pending/Partial/Paid/Overdue), method, reference

**Commission**
- id, transaction_id (FK), expected, received, outstanding, agent_share, company_share, payment_date, payment_status

**MarketingCampaign**
- id, property_id (FK), status (Draft/In Review/Scheduled/Published), content (JSON), scheduled_date, published_date, created_by (FK)

**CampaignPerformance**
- id, campaign_id (FK), views, enquiries, leads_generated, viewings_booked, conversions, recorded_at

**Task**
- id, title, related_model, related_id (generic FK), owner_id (FK→User), status (Open/In Progress/Done), due_date, created_at

**Notification**
- id, recipient_id (FK), type, message, related_model, related_id, read, created_at

**AuditLog**
- id, actor_id (FK), action, model_name, object_id, old_value (JSON), new_value (JSON), timestamp

**Relationships summary:** see `architecture.md` §7 for the visual join diagram.

*Action for you:* Feed this field list into a tool like dbdiagram.io or drawSQL to render the actual visual ERD for the client — I can also generate that as a Mermaid diagram inline if you want it rendered here.

### 1.3 Data Ownership Matrix (confirmed from spec §5)

| Entity Group | Owning Department |
|---|---|
| Property, Owner, Media, Documents | Listing |
| Lead, Client, Viewing, FollowUp | Sales |
| MarketingCampaign, CampaignPerformance | Marketing |
| Transaction, Payment, Commission | Finance |
| Task (staff-related), Department | Operations |
| User, Role, Permission | CEO / Admin |

### 1.4 Status Enums (state machine values)

**Property status:** Draft → Onboarding → Pending Verification → Verified → Pending Approval → Marketing Ready → Published → Under Offer → Sold/Rented → Archived

**Lead status:** New → Contacted → Qualified → Property Matched → Viewing → Negotiation → Closed / Lost

**Viewing status:** Scheduled → Confirmed → Completed → Cancelled → No-show

**Transaction status:** Offer → Negotiation → Agreement → Documentation → Payment → Closing → Commission → Closed

**Payment status:** Pending → Partial → Paid → Overdue

### 1.5 RBAC Matrix (full — per spec §17 requirement)

Legend: V=View, C=Create, E=Edit, D=Delete, A=Assign, Ap=Approve, P=Publish, X=Export

| Resource | CEO | Listing | Sales | Marketing | Finance | Operations |
|---|---|---|---|---|---|---|
| Property | V,C,E,D,Ap,P,X (Company) | V,C,E (Own/Team) | V (Company, read-only) | V (Published only) | V (Company) | V (Company) |
| Property Verification | Ap (Company) | C,E (submit only) | — | — | — | V |
| Lead | V,X (Company) | — | V,C,E,A (Own/Assigned) | — | — | V (Company) |
| Client | V,X (Company) | — | V,C,E (Own/Assigned) | — | V (transaction-linked) | V (Company) |
| Viewing | V,X (Company) | — | V,C,E (Own/Assigned) | — | — | V,E (scheduling support) |
| Transaction | V,Ap,X (Company) | — | C (initiate only) | — | V,C,E (Company) | V (Company) |
| Payment/Commission | V,X (Company) | — | — | — | V,C,E,Ap (Company) | — |
| Marketing Campaign | V,X (Company) | — | — | V,C,E,P (Own/Team) | — | V |
| User/Role/Permission | V,C,E,D,A (Company) | — | — | — | — | V,C,E (staff records only) |
| Reports (all) | V,X (Company) | V (Listing reports, Own/Team) | V (Sales reports, Own/Team) | V (Marketing reports) | V,X (Finance reports) | V,X (Ops/staff reports) |
| Audit Log | V (Company) | — | — | — | — | V (Company, monitoring) |

*Action for you:* This matrix needs Horilux sign-off — it's your interpretation filling gaps the spec left implicit (e.g. exact Sales/Finance boundary on Transaction). Flag it explicitly as "draft, pending confirmation" when you send it.

### 1.6 Workflow Diagrams (described — draw as flowcharts)

**Property workflow:**
```
Find Property → Onboard → Collect Info → Collect Docs → Verify (checklist)
   → Manager Approval [gate: Approve permission] → Marketing Prep → Publish
```

**Client/Lead workflow:**
```
Lead Generated (web enquiry OR manual) → Captured → Assigned [gate: Assign permission]
   → Qualified → Property Matched → Viewing Scheduled → Viewing Completed
   → Follow-up → Negotiation → Transaction (handoff to Transaction workflow)
```

**Transaction workflow:**
```
Negotiation → Agreement → Documentation → Payment → Closing
   → Commission [gate: Finance Approve] → Reporting
```

Each arrow = a guarded transition (RBAC check + business rule check) that can fire a Task/Notification per §9 automation rules.

---

## PHASE 1 DELIVERABLE CHECKLIST (for Horilux sign-off)

- [x] System architecture diagram + stack rationale
- [x] ERD (field-level, ready to visualize)
- [x] RBAC matrix (draft — needs confirmation)
- [x] Workflow diagrams (described — needs visual flowchart)
- [ ] Wireframes (Phase 2 — not started)
- [ ] API documentation (skeleton in `architecture.md` §8, needs full schema)
- [ ] Infrastructure/deployment plan (hosting decision pending — see Open Decisions)
- [ ] Project plan with timeline/milestones (below)
- [ ] Testing plan (below)

---

## PHASE 2 — Design

**Deliverables:**
- Sitemap (public site): Home → Search → Property Detail → Enquiry → Schedule Viewing → Agent Profile → Contact
- Admin sitemap: Login → Role-based Dashboard → [Properties | Leads | Viewings | Transactions | Marketing | Reports] per role's permitted resources
- Wireframes: low-fidelity first, one per core page/screen listed in spec §12/§13
- Design system: apply brand guidelines — Manrope typeface, Midnight Blue #240270 primary, Forest Green #003E03 and Kokoda #7A6D0C as accents, sharp-edged/slanting-line pattern motif from brand guide
- Responsive breakpoints for both public site and admin dashboard

**Not yet started** — this is genuinely a separate design pass, distinct from architecture.

---

## PHASE 3 — Backend Foundation

**Builds:** `accounts` (User, Role, Permission, Department, RBAC resolver), `audit` (AuditLog + signal hooks), `workflow` (state machine base classes), JWT auth, base DRF project structure.

**Definition of done for this phase:** a user can log in, is assigned a role, and every API endpoint correctly allows/denies based on the RBAC matrix in 1.5 — testable independent of any business feature existing yet.

---

## PHASE 4 — Property

**Builds:** `properties` app — Property, Owner, Media, Document, VerificationChecklist models; state machine per 1.4/1.6; completion-percentage calculation; submit-for-approval flow.

---

## PHASE 5 — CRM

**Builds:** `crm` (Lead, Client) + `viewings` (Viewing, FollowUp) apps; lead pipeline state machine; overdue follow-up detection (Celery beat task).

---

## PHASE 6 — Transactions & Finance

**Builds:** `transactions` app — Transaction, Payment, Commission models; transaction state machine; commission calculation logic *(blocked on Open Decision #5 below)*.

---

## PHASE 7 — Marketing

**Builds:** `marketing` app — Campaign, CampaignPerformance; enforces "approved properties only" input rule from spec §11; publish scheduling.

---

## PHASE 8 — Reports & Automation

**Builds:** `reporting` app (per-department report endpoints + CEO dashboard aggregation), `notifications` app, and the full Task-automation rule set from spec §9 (property submitted → verification task, etc.) wired via Celery.

---

## PHASE 9 — Testing

**Test plan categories (per spec §17):**

| Type | What's covered |
|---|---|
| Functional | Each workflow transition, CRUD per entity |
| Permission | Every cell of the RBAC matrix (1.5) — automated test per role × action × resource |
| Security | Auth flows, token expiry, SQL injection/XSS basics, file upload validation |
| Responsiveness | Public site + admin on mobile/tablet/desktop breakpoints |
| Performance | Property search under load, dashboard aggregation query time |
| Data Integrity | FK cascade behavior, audit log completeness, no orphaned records |

---

## PHASE 10 — Launch

- Production deploy (Horilux-owned hosting account per spec §21)
- SSL, domain DNS cutover
- Backup schedule confirmed (daily Postgres snapshot + storage versioning)
- Monitoring (Sentry + uptime) live
- Staff accounts created, onboarding walkthrough delivered

---

## Timeline & Milestones (draft — needs your estimation)

| Phase | Depends on | Rough effort (fill in) |
|---|---|---|
| 1. Discovery & Architecture | — | *this package* |
| 2. Design | Phase 1 sign-off | ? |
| 3. Backend Foundation | Phase 1 | ? |
| 4. Property | Phase 3 | ? |
| 5. CRM | Phase 3 | ? |
| 6. Transactions | Phase 3, Phase 4 (property link) | ? |
| 7. Marketing | Phase 4 (needs approved properties) | ? |
| 8. Reports & Automation | Phases 4–7 | ? |
| 9. Testing | Phases 3–8 | ? |
| 10. Launch | Phase 9 | ? |

*You know your own working pace better than I can estimate — fill in effort/dates once you've scoped Phase 2 design time with the client.*

---

## Open Decisions (blocking specific phases — carried from architecture.md §11)

1. **Hosting target** — blocks Phase 10 planning
2. **Search implementation** (Postgres FTS vs dedicated engine) — blocks Phase 4
3. **WhatsApp/SMS provider** — post-MVP, not blocking
4. **Multi-branch support at MVP or not** — blocks Phase 1 sign-off (changes User/Department model)
5. **Commission calculation rules** — blocks Phase 6

---

*This package + `architecture.md` together constitute the Phase 1 discovery deliverables per spec §17, excluding wireframes (Phase 2) and finalized API schema (produced alongside each phase's models).*
