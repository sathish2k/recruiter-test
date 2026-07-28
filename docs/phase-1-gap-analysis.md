# Phase 1 gap analysis

Assessed 28 Jul 2026 against `requirements.md`, `delivery-plan.md`, `ats-app-flow.md`
and the 70-screen reference design. Each row states what exists in code, what the
design provides, and what remains.

**Status key** — `Built` shipped and wired · `Partial` screen exists, gap named ·
`Design only` design exists, no code · `Neither` no design and no code, spec is in
the requirements.

---

## 1. Summary

| | Count |
|---|---|
| Design screens | 70 |
| Routes implemented | 26 |
| Phase 1 modules built | 6 of ~18 |
| Golden-path stages covered end to end | 3 of 9 |

The built half is **intake**: auth, clients, contacts, requirements, candidates,
settings. The unbuilt half is **the cycle** — pipeline, review, submission,
interviews, offers, placement, invoicing, commissions — plus all three portals
and billing. `ats-app-flow.md` §13 puts applications with manual stage moves on a
kanban *inside* Phase 1; that is the single largest remaining item.

---

## 2. Built — verify against the docs, do not rebuild

| Module | Route | Notes against the requirements |
|---|---|---|
| Auth — login, create account, forgot/reset | `/login` `/create-account` `/forgot-password` `/reset-password` | §5.1.1–5.1.4 |
| Dashboard | `/` | §5.2 widgets present |
| Clients — list, add/edit, detail | `/clients` `/clients/:id` | §5.3. Detail has header, KPIs, submissions, workspace tabs, rail |
| Contacts — list, add/edit, detail | `/contacts` `/contacts/:id` | §5.4. Detail added this cycle |
| Requirements — list, add/edit | `/jobs` `/jobs/new` `/jobs/:id/edit` | §5.5.1–5.5.2 |
| Candidates — list, add/edit | `/candidates` … | §5.6.1–5.6.2 |
| Settings — workspace, members, roles, templates, integrations, billing, security, audit log | `/settings/*` | §5.19, the Done rows |
| Profile settings | `/account/*` | §5.21 |

---

## 3. Gaps that block the Phase 1 exit criteria

Ordered by `requirements.md` §7.2 ranking, with the exit criterion each blocks.

| # | Item | Design | Blocks |
|---|---|---|---|
| 1 | **Pipeline / kanban + application record** | `Pipeline`, `Pipeline First Run` | Exit 1 — there is no application entity, so no cycle exists |
| 2 | **CV review queue with send-back** | `CV Review` | Exit 1 · TC-CVR-001 |
| 3 | **Submission with consent, anonymise, snapshot** | in `Pipeline` | Exit 1 · REG-03, REG-04 |
| 4 | **Interviews, scheduling, scorecards** | `Interviews`, `Schedule Interview`, `Interview Scorecard` | Exit 1 |
| 5 | **Offers with band validation and revision history** | `Offer Detail` | Exit 1 · TC-OFR-001–003 |
| 6 | **Placements, invoicing, guarantee, fallout** | `Placements` | Exit 1 · REG-07 |
| 7 | **Commissions with splits and snapshot-at-acceptance** | `Commissions` | Exit 1 · REG-05, REG-06 |
| 8 | **Client portal + magic link** | `Client Portal`, `Client Portal Login` | Exit 1 · REG-08 |
| 9 | **Careers board, apply, candidate portal** | `Careers Board`, `Apply`, `Application Status` | Exit 1 |
| 10 | **Billing limit states** | `Plan Limits` | Exit 4 · REG-09 |
| 11 | **Verify email — mandatory** | `Verify Email` | Exit 1 · TC-AUTH-004 |
| 12 | **Setup wizard** | `Get Started` | Exit 1 |
| 13 | **Team invite acceptance** | `Team Sign Up` | TC-AUTH-014–016 |
| 14 | **Multi-currency** — client billing currency, stored FX rate | Neither | Exit 3 · TC-CUR-001–003 |
| 15 | **String catalogue + Requirement terminology** | Neither | Exit 6 · TC-SET-004 |
| 16 | **Archive vs erasure as distinct paths** | Neither | Exit 5 · REG-10 |
| 17 | **Settings → Pipeline** (stages, SLAs, rejection reasons) | Neither | TC-SET-001 |
| 18 | **Settings → Data & privacy** (retention, residency, export) | Neither | TC-SET-002 |
| 19 | **Tasks** | Neither | §5.14 |
| 20 | **Post-offer onboarding checklist** | Neither | §5.11 |
| 21 | **Mobile layouts** for 5 screens | `Responsive Preview` | Exit 7 |
| 22 | Analytics, Client report, Team activity | `Analytics`, `Client Report`, `Team Activity` | §5.18 |
| 23 | AI screening settings, credits-exhausted state | `AI Screening` | §5.17.1 |
| 24 | First-run states (7 modules) | `* First Run` | §5.21 |
| 25 | Marketing — Landing, Pricing, How It Works | `Landing v2`, others deleted | §5.21 |

### Design-only screens deliberately **not** to build

`requirements.md` §7.3 drops these: `Component Library`, `MUI Handoff`,
`Responsive Preview`, `Screen Directory` (design artifacts), `Employee Dashboard`
and `Lead Dashboard` (role-filtered views of the main dashboard), and the second
of `LinkedIn Extension` / `Sourcing Plugin`.

---

## 4. Corrections to what is already built

| Screen | Correction | Source | Status |
|---|---|---|---|
| Sidebar and all copy | "Jobs" → "Requirement" | D6, §2 | **Done** |
| Everywhere | Archive action, never delete | §6.1, TC-CLI-005 | **Done** — clients, requirements, candidates |
| Client add/edit | Billing currency, tax treatment | D1.1, §5.3.2 | **Done** — field only; FX capture still to build |
| Client add/edit | Off-limits period | §5.3.2, TC-CLI-007 | **Done** — field only; derivation needs placements |
| Requirement add/edit | Assigned team required on create | §5.5.2, TC-REQ-001 | **Done** |
| Requirement add/edit | Role category, work model, priority | §5.5.2 | **Done** |
| Requirement add/edit | Reference (REQ-nnnn) | §5.5.2 | Column added, generator to build |
| Requirement add/edit | Knockout questions, stage SLAs | §5.5.2 | To build |
| Candidate add/edit | Availability, available-from, tags, do-not-contact | §5.6.2 | **Done** |
| Candidate add/edit | Consent, off-limits | §5.6.2 | Columns added; both need applications/placements |
| Candidate list | Availability column | §5.6.1 | **Done** |
| Candidate list | Off-limits shield, live application count | §5.6.1 | Blocked on placements and applications |
| Contact list | Portal access state column | §5.4.1 | Blocked on the portal concept |
| Requirement list | Import CSV dead button | §5.5.1 | Not present in our list — nothing to remove |
| All screens | Display strings in one catalogue | D6, Exit 6 | Partial — see below |

**On the string catalogue.** The app already has a real i18n layer: one
`*.translations.json` per component, resolved through `useTranslation(id)` with
locale fallback. D6 asks for a single file; the distributed form is equivalent
for the purpose (nothing is inline in a component) and is how the engine binds
translations to components. What does violate Exit 6 is the literal fallback
argument — `t("form.suggest", "Suggest")` — used in the shared widgets. Those
should move into a shared catalogue before launch; TC-SET-004 (pseudo-locale
prefixing) is the test that finds them all.

---

## 5. Test suite

`e2e/` now holds the Playwright suite from `delivery-plan.md` §1.4, with each
test named for its `test-cases.md` ID.

```
e2e/auth.setup.ts                       one sign-in, reused by every project
e2e/fixtures/app.ts                     navigation + config-driven form helpers
e2e/journeys/01-client-contact-requirement.spec.ts   runs today
e2e/journeys/02-candidate-intake.spec.ts             runs today, 6 stubs
e2e/journeys/03-golden-path.spec.ts                  all stubs — section 3 above
e2e/journeys/04-tenancy-rbac.spec.ts                 2 run, 4 stubs
e2e/journeys/05-mobile.spec.ts                       2 run, 3 stubs
```

Run with `bun run test:e2e`, after `E2E_EMAIL` and `E2E_PASSWORD` are set to a
seeded test workspace.

Journeys whose feature does not exist are `test.fixme`, not deleted — the suite
is the Phase 1 checklist. **Remove a `.fixme` as each feature lands; never
delete a test to make the run green.**

The suite needs two things it does not have yet, both named in the plan:

- **A seeding API** (§4.3) so every layer builds fixtures the same way, and so
  RBAC journeys can create a sourcer, a recruiter and a lead.
- **A controllable clock** (§4.3) — SLA breach, trial expiry, guarantee end and
  re-engagement are all tested by advancing time, never by waiting.

---

## 6. Build order — walked as the user walks it

Exit criterion 1 is *"a new agency completes signup → first placement → paid
invoice without support intervention"*. So the order below is the journey in
sequence, and **the first wall a real user hits is the first thing to build**.

Where an item needs something built out of order, the dependency is named.

Legend — ✅ works · ⚠️ exists with a gap · ❌ wall.

---

### Step 1 · Sign up ✅

The form, the workspace and the owner user are created.

### Step 2 · Verify email ✅ *(built)*

Sign-up now lands on `/verify?email=…` instead of `/login`. A 6-digit code and a
magic link go out together, both expiring in 30 minutes; a resend is capped at
one a minute and five an hour, and five wrong codes burn the row.

The part that mattered most is the **server-side gate**: `isVerified` in
`apps/api/src/plugins/auth-guard.ts` returns `403 {code:"email-unverified"}`,
and the create routes for clients, contacts, requirements and candidates use it
instead of `isAuth`. An unverified account can look around and cannot write.
There is no skip control on the screen, and TC-AUTH-004 asserts its absence.

| Piece | Where |
|---|---|
| Table (code, token, attempts, resend counters) | `models/email-verification.model.ts` |
| TTL, cooldown, hourly cap, attempt cap | `services/email-verification.service.ts` |
| `POST /auth/verify/send` · `/confirm` · `GET /verify/link` | `routes/auth.routes.ts` |
| Screen (countdown, resend, magic link, expired, verified) | `packages/shared/src/components/auth/verify-email.tsx` |
| Route `Auth.VerifyEmail.Route` at `/verify` | `packages/configurations/src/routes.ts` |

**Not done:** an unknown address returns success rather than an error, which is
correct, but it means a mistyped address gives no feedback at all — worth a
"didn't get it?" path later. Mail delivery itself is Mailjet's, unchanged.

### Step 3 · Setup wizard ✅ *(built)*

Both screens from the design exist: `/get-started` (the five-step checklist) and
`/setup` (the five-step wizard — basics, pipeline, rejections, team, review).

Every wizard step autosaves its own slice **including the step number**, so
flow §1.4's resumability is server-side rather than a `localStorage` key: close
the tab, come back, and the screen returns to the step you left with a "picked
up where you left off" banner.

Two models came out of this that step 8 needs anyway:
`pipeline_stage` (name, position, `client_visible`, and a `kind` marking the
fixed entry and hire ends) and `rejection_reason` (category, label, active).
Both seed their defaults on first read, so workspaces created before they
existed get them too.

The checklist derives completion from **real records** — a client exists, a
requirement exists, an invite is out or a second member joined, the extension
and calendar integrations are connected. Nothing is a stored flag and nothing is
tickable by hand, so a step completed elsewhere in the app ticks itself.

| Piece | Where |
|---|---|
| Stage + rejection-reason tables | `models/pipeline.model.ts` |
| Seeding, reorder, replace | `services/pipeline.service.ts` |
| Checklist derivation, wizard state, save | `services/onboarding.service.ts` |
| `GET /onboarding/checklist` · `GET`/`PUT /onboarding/setup` | `routes/onboarding.routes.ts` |
| Screens | `packages/shared/src/components/onboarding/` |
| Module, routes, pages | `packages/modules/recruit-onboarding/`, `configurations/` |

**Deliberately not built:** the design's seat counter ("5 of 10 seats used on
Growth") needs the entitlement data that billing limit states will bring, and
faking a plan name would be worse than omitting it. The design's "FLOW:
Fresh start / Resumed" pill tabs are a prototype state-switcher, not product UI.

### Step 4 · Dashboard ✅

Lands correctly. Counts will need rechecking once applications exist.

### Step 5 · Add client + primary contact ✅

Including billing currency, tax treatment and off-limits period, all added this
cycle.

### Step 6 · Create requirement + assign team ⚠️

Works, and the team is now required on create. Still missing: the REQ-nnnn
reference generator, knockout questions, and per-stage SLA overrides.

### Step 7 · Get candidates in ⚠️

Manual add works. The other three intake paths of flow §4 do not exist:
resume-upload-to-record, CSV import, and inbound apply. **Duplicate detection
and field-level merge are missing on every path** — flow §4 says all five must
run the same check, and TC-CAN-001/002 are P0.

### Step 8 · Pipeline ❌ **← the second wall, and the widest**

There is no `application` record, so there is nothing to put on a board.

Build in this order inside the step:
1. `applications` — candidate × requirement, with `stage`, `status`,
   `owner_id`, `consent_at`, `rejection_reason`; unique on `(candidate_id, job_id)`
2. `application_stage_history` — **same commit**; it cannot be backfilled and
   every metric the product sells reads from it
3. one transition function that writes history, activity, notification and task
   together (flow §5 — do not scatter these across UI handlers)
4. the board itself, then rejection-with-reason, advisory WIP (D4), and the
   off-limits / offer-elsewhere guards

**Size:** L. This is the single largest item in Phase 1.

### Step 9 · CV review ❌

Queue between screening and submission. Send-back returns to Sourced and is
**not** a rejection (TC-CVR-001).

### Step 10 · Consent, then submit ❌

Consent is per client, never blanket (TC-SUB-002), and submission is blocked
without it (TC-SUB-001). Submitting freezes a snapshot of exactly what was sent
and starts the client SLA clock.

### Step 11 · Client reviews in the portal ❌

Magic link, single-use, 13 days. Approve or decline with a mandatory reason.
Sees only their own client's submissions.

### Step 12 · Interview + scorecard ❌

Scheduling with panel availability; scorecards with must-haves all rated and a
mandatory primary reason on any negative recommendation.

### Step 13 · Offer + negotiation ❌

Band validation against the requirement's salary band (**the band exists**),
revision history recording actor, field, from, to and reason.

**Money note:** FX capture and tax treatment are formally needed at step 16, but
build them here. Offers are the first screen that has to be right about
currency, and the delivery plan §6 names retrofitting money as the classic
Phase 1 overrun.

### Step 14 · Accept → cascade ❌

Prompts a withdrawal on the candidate's other live applications, drafted for
review, never auto-sent, with an explicit opt-out.

### Step 15 · Onboarding checklist ❌

The gap where placements are lost (§5.11). Cannot move to Placed until the
joining date is confirmed.

### Step 16 · Placed → invoice → commission ❌

Openings decrement and auto-close; guarantee and off-limits dates derive from
the client terms (**both fields exist**); invoice with the right tax treatment;
commission split totalling 100, snapshotted at acceptance, house share for
inbound.

### Step 17 · After ❌

Fallout reopens the requirement; guarantee-end and +12/+24-month re-engagement
tasks.

---

### Running alongside — no flow position, cheapest early

| Item | Why not in the walk |
|---|---|
| Shared string catalogue (remove literal fallbacks) | Cross-cutting. Every widget added after this inherits the problem |
| `requirement` rename in DB + API | The UI already says Requirement; the schema does not. A rename after launch costs a migration and an API version |
| Settings → Pipeline, Data & privacy | Configuration for steps 8 and 10; the **stage model** is needed at step 8, the **screen** can follow |
| Billing limit states | An entitlement check sits on each creation path, so it lands after those paths exist |
| Mobile layouts | Three of the five required screens do not exist until steps 8 and 12 |
| Analytics | Reads `application_stage_history` from step 8 |

---

### The answer to "what first"

~~**Step 2, verify email.**~~ Done, together with step 3 — see those sections
for what landed and what was deliberately left out.

**Step 8, the application record.** It is now both the first broken thing a real
user hits *and* the widest item on the list, and it blocks steps 9 through 17.
Start with `applications` and `application_stage_history` in one commit: the
history table is the only thing here that cannot be backfilled.

The stage model it needs already exists — `pipeline_stage` came out of the setup
wizard, with the entry and hire ends marked — so the board can reference stages
by id from the first commit rather than hardcoding names and being rebuilt.
