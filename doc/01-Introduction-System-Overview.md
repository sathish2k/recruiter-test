# Module 01 - Introduction & System Overview

Version: 2.0

> **Open question:** `doc/00-Glossary-and-Conventions.md` does not exist in this
> repository at the time of writing, so no canonical enum, ID format, currency
> or SLA catalogue was available to reconcile this chapter against. Every
> machine value below is either taken from the implemented code
> (`packages/types/src/index.ts`, `apps/api/src/models/`) or marked
> **PROPOSED**. When Module 00 is written it becomes authoritative: any value
> here that disagrees with it must be corrected here, not there.

---

# 1. Overview

## 1.1 Purpose

HirePilotX is an AI-assisted Applicant Tracking System (ATS) built for
recruitment agencies, not for in-house talent teams. The distinguishing
assumption is that the agency does not own the hiring decision: it sources
candidates, screens them, and **submits** them to a client who accepts or
rejects. Everything in the product follows from that — a submission is a
first-class record, client feedback is measured against an SLA, and revenue is
earned per placement rather than per seat.

The system manages the full lifecycle: client onboarding, fee agreement,
requirement intake, sourcing, AI screening, internal CV review, client
submission, interviewing, offer, placement, invoicing and recruiter commission.

## 1.2 Scope of this chapter

This chapter is the map, not the territory. It defines:

- who the users are (§2);
- the complete module catalogue and its grouping (§3);
- the navigation model and how it is scoped by role (§4);
- the **two parallel funnels** the product runs on (§5);
- the end-to-end lifecycle including the sourcing half and the money tail (§6);
- the entity relationship map (§7);
- the three-dimensional data-scoping model (§8);
- identifiers (§9), vocabulary (§10) and design principles (§11).

Field-level specification of any entity belongs to that entity's own chapter.
Where this chapter names a field it does so only to establish a relationship.

## 1.3 Source screens

`AIRecruiter - Dashboard`, `AIRecruiter - Screen Directory`,
`AIRecruiter - Get Started`. Navigation scoping was cross-checked against
`AIRecruiter - Lead Dashboard` and `AIRecruiter - Employee Dashboard`, because
the agency-wide Dashboard alone does not show the scoped variants.

## 1.4 How to read the tables

Every field table in the doc set uses the same four columns:
**Field | Type | Required | Rules/Notes**. Every status, stage or enum value is
given as a machine value **and** a display label; the machine value is what the
API and the audit log carry, the display label is what a user reads and what
translation files key against.

---

# 2. Primary users

| Machine value | Display label | Scope | Notes |
|---|---|---|---|
| `admin` | Agency owner / Admin | Whole workspace | Implemented as a single role today. The designs show "Agency owner" only. |
| `lead` | Profile Lead | Assigned clients and assigned requirements | Reviews CVs and submits to the client. |
| `employee` | Employee (Sourcer) | Assigned requirements only | Builds the pipeline: invites, connections, JD shares, CV collection. |
| `client` | Client contact | One client's own submissions | External identity. Reaches the client portal, never the agency workspace. |

Rules:

| # | Rule |
|---|---|
| 2.1 | A person's role is a property of their membership of a workspace, not of their identity. The same email may hold different roles in different workspaces. |
| 2.2 | `client` is not an agency member and does not consume a seat. |
| 2.3 | The role alone never determines what data a member sees. It is combined with the client-access list and the assignment set (§8). |
| 2.4 | An agency-wide user may **preview** the app as another member. Preview is read-only and carries a persistent banner naming the previewed member, their role and their client access, plus an exit control. |

> **Open question:** the doc set currently names four roles (Workspace Owner,
> Profile Lead, Recruiter, Viewer) while the code ships four different ones
> (`admin`, `lead`, `employee`, `client`) and the designs use an eighth
> vocabulary again (Owner, Admin, Recruiter, Team Lead, Sourcer, Profile Lead,
> Hiring Manager, Finance). "Viewer" appears in no design and in no code.
> Module 02 owns the reconciliation; this chapter deliberately uses the
> implemented values so that nothing here is invented. PROPOSED - needs product
> sign-off: `owner` and `admin` split apart, `employee` renamed `recruiter`,
> `Viewer` dropped, and `Sourcer` retained as a shipped custom role rather than
> a system role.

---

# 3. Module catalogue

The previous version of this chapter listed 16 modules. The designed product is
larger. The catalogue below is grouped by the navigation section each module
appears in, and names the chapter that specifies it.

## 3.1 MAIN

| Module | Resource key | Chapter |
|---|---|---|
| Dashboard | `dashboard` | 26 |

## 3.2 RECRUITMENT

| Module | Resource key | Chapter |
|---|---|---|
| Clients | `clients` | 06, 07 |
| Client Contacts | `contacts` | 08, 09 |
| Jobs / Requirements | `jobs` | 10, 11 |
| Candidates | `candidates` | 12, 13 |
| Pipeline (board view of Candidates) | `candidates` | 14 |
| Sourcing & Outreach | `sourcing` (PROPOSED) | 15, 16 |
| CV Review | `submissions` (PROPOSED) | 18 |
| Submissions & Client Review | `submissions` (PROPOSED) | 19 |
| Interviews | `interviews` | 21, 22 |
| Offers | `offers` (PROPOSED) | 23 |
| Placements | `placements` (PROPOSED) | 24 |

## 3.3 INSIGHTS

| Module | Resource key | Chapter |
|---|---|---|
| Analytics & Reports | `analytics` (PROPOSED) | 27 |
| Commissions & Payouts | `commissions` | 25 |
| Team Activity | `teamActivity` (PROPOSED) | 28 |

## 3.4 AI

| Module | Resource key | Chapter |
|---|---|---|
| AI Screening | `aiScreening` (PROPOSED) | 17 |
| Automation | `automation` (PROPOSED) | 31 |

## 3.5 TOOLS

| Module | Resource key | Chapter |
|---|---|---|
| Settings (hub — see §4.5) | `settings` | 03, 04, 05, 32, 34, 35 |
| Integrations & Calendar Sync | `integrations` (PROPOSED) | 33 |
| Help Center | `helpCenter` (PROPOSED) | 39 |

## 3.6 Modules that exist but are not sidebar entries

| Module | Reached from | Chapter |
|---|---|---|
| Notifications | Top-bar bell, and the account menu | 30 |
| Messages / Inbox | Not currently linked from any shipped nav | 29 |
| Client Portal | External magic-link URL, outside the workspace shell | 20 |
| Onboarding (Get Started) | Post-signup redirect; skippable | 36 |
| Import / Export | Actions inside each list | 37 |
| Profile Settings | Account menu | 03 (per-user overrides) |
| Billing | Settings tab | 34 |
| Audit Log | Settings tab | 35 |

> **Open question:** the Dashboard's translation dictionary carries entries for
> `pipeline` and `messages`, and the Screen Directory lists a Pipeline screen,
> but neither appears in any shipped sidebar. PROPOSED - needs product
> sign-off: Pipeline is a **view toggle** on Candidates rather than a nav item,
> and Messages is deferred out of the first release.

---

# 4. Navigation

## 4.1 Structure

Navigation is a fixed left sidebar with five labelled groups, in this order.
Group labels are rendered in upper case and are not clickable.

| Order | Group machine value | Group display label |
|---|---|---|
| 1 | `main` | MAIN |
| 2 | `recruitment` | RECRUITMENT |
| 3 | `insights` | INSIGHTS |
| 4 | `ai` | AI |
| 5 | `tools` | TOOLS |

The agency-wide sidebar contains these items:

| Group | Item machine value | Display label | Target |
|---|---|---|---|
| `main` | `dashboard` | Dashboard | Dashboard |
| `recruitment` | `clients` | Clients | Clients list |
| `recruitment` | `contacts` | Contacts | Contacts list |
| `recruitment` | `jobs` | Jobs | Requirements list |
| `recruitment` | `candidates` | Candidates | Candidates list |
| `recruitment` | `interviews` | Interviews | Interviews hub |
| `recruitment` | `placements` | Placements | Placements list |
| `insights` | `analytics` | Analytics | Analytics |
| `insights` | `commissions` | Commissions | Commissions |
| `insights` | `teamActivity` | Team Activity | Team Activity |
| `ai` | `aiScreening` | AI Screening | AI Screening |
| `ai` | `automation` | Automation | Automation |
| `tools` | `settings` | Settings | Settings hub |
| `tools` | `integrations` | Integrations | Integrations |
| `tools` | `helpCenter` | Help Center | Help Center |

Rules:

| # | Rule |
|---|---|
| 4.1.1 | An item is rendered only if the signed-in member holds `read` on its resource. There is no disabled or greyed nav item — a denied item is absent. |
| 4.1.2 | A group whose items are all absent is itself absent, including its label and its divider. |
| 4.1.3 | Exactly one item is in the active state at a time, resolved from the current route, not from click history. |
| 4.1.4 | The sidebar is collapsible. The collapsed/expanded choice is a per-user preference and persists across sessions and devices. |
| 4.1.5 | Nav labels are translated. Four locales ship: `en` English, `hi` हिन्दी, `de` Deutsch, `es` Español. Group labels are translated too. |
| 4.1.6 | The sidebar footer holds either the plan upsell card (workspaces on a plan that can upgrade) or the **role card** (name, role, client-access list). A workspace on a paid plan never sees the upsell. |

## 4.2 Role-scoped navigation

Navigation is not one list filtered by permission alone; the designs ship three
distinct sidebars. The matrix below is the observed behaviour.

| Item | `admin` | `lead` | `employee` |
|---|---|---|---|
| Dashboard | Yes | Yes | Yes |
| Clients | Yes | No | No |
| Contacts | Yes | No | No |
| Jobs | Yes — label **Jobs** | No | Yes — label **My Jobs** |
| Candidates | Yes | Yes | Yes |
| Interviews | Yes | Yes | No |
| Placements | Yes | No | No |
| Analytics | Yes | Yes | Yes |
| Commissions | Yes | Yes | Yes |
| Team Activity | Yes | No | No |
| AI Screening | Yes | Yes | Yes |
| Automation | Yes | No | No |
| Settings | Yes | No | No |
| Integrations | Yes | No | Yes |
| Help Center | Yes | No | Yes |

Rules:

| # | Rule |
|---|---|
| 4.2.1 | **My Jobs** is not a separate module. It is the Requirements list pre-filtered to requirements the signed-in member is assigned to, with the filter locked. The label changes; the resource does not. |
| 4.2.2 | A member who cannot see Clients in the nav may still see a client **name** as context on a requirement, a candidate or a submission they are entitled to. The nav item is hidden; the client label is not redacted. |
| 4.2.3 | Workspace settings remain reachable from the account menu for every role, because per-user preferences live behind it. Tabs the member cannot read are absent (Module 05). |
| 4.2.4 | Removing a nav item never removes the underlying permission check. Route guards are authoritative; the sidebar is a convenience. |

> **Open question:** the Profile Lead sidebar in the designs has **no TOOLS
> group at all** — no Integrations, no Help Center — while the Employee sidebar
> has both. A lead losing access to the Help Center while their own sourcers
> keep it appears to be an oversight rather than a rule. PROPOSED - needs
> product sign-off: Help Center is visible to every role unconditionally, and
> Integrations follows `integrations.readonly`.

> **Open question:** the Profile Lead sidebar also omits Jobs entirely, so a
> lead has no route to the requirement they are reviewing against. PROPOSED -
> needs product sign-off: leads see **My Jobs** on the same rule as employees,
> scoped to requirements where they hold the profile-lead duty.

## 4.3 Global chrome

Present on every workspace screen regardless of role:

| Element | Behaviour |
|---|---|
| Greeting line | Time-of-day greeting plus the member's first name, then a one-line "what needs you today" summary. The summary is role-specific and is generated from the member's own queues. |
| Command palette | Opened with `⌘K` from anywhere. Searches screens, candidates, requirements and clients. Results respect the member's data scope. |
| Notifications bell | Shows an unread count, capped at `99+`. Opens a panel; a "View all notifications" link opens Module 30. |
| Account menu | My profile, Notifications, Keyboard shortcuts (`?`), Workspace settings, Help center, Release notes, Sign out. Displays the workspace name, the member's role chip, and — for scoped roles — who they report to or which clients they cover. |
| Locale switcher | Sets the display language for the signed-in user only. |
| Theme switcher | Light/dark, per user. |

## 4.4 Nav-adjacent actions

| Action | Where | Notes |
|---|---|---|
| Invite teammates | Dashboard and Settings → Members | Includes a copyable workspace join link of the form `/join/<workspace-slug>`. |
| Export | Every list and analytics surface | PDF, Excel and Word. See Module 37. |
| Global create | Per-module primary action | There is no single global "New" button; each list owns its create action. |

## 4.5 The Settings hub

Settings is one nav item resolving to a tabbed hub. Each tab is gated by its own
permission key and is absent — not disabled — without it.

| Tab | Permission key | Chapter |
|---|---|---|
| Workspace | `workspace.manage` | 03 |
| Members | `members.view` | 04 |
| Roles & Permissions | `roles.manage` | 05 |
| Email Templates & Branding | `templates.manage` | 32 |
| Integrations | `integrations.manage` / `integrations.readonly` | 33 |
| Billing, Plans & Seats | `billing.view` | 34 |
| Security & Sessions | `security.view` | 35 |
| Audit Log | `audit.view` | 35 |

---

# 5. The two funnels

HirePilotX runs **two funnels in series**, owned by two different people, joined
at a single hand-off. Analytics stitches them together; every other screen shows
one or the other. Treating them as one funnel is the most common modelling
mistake in this product and is the reason submission-stage and sourcing-stage
vocabularies keep colliding.

## 5.1 Funnel A — the sourcing funnel

Owner: the **Employee (Sourcer)**. Measured per member per day, against a daily
invite target set on the assignment.

| Order | Machine value | Display label | Enters when |
|---|---|---|---|
| 1 | `invited` | Invited | An outreach invite is sent to a prospect on a named requirement. |
| 2 | `connected` | Connected | The prospect accepts the connection or replies. |
| 3 | `jd_shared` | JD shared | The requirement's job description is sent to the connected prospect. |
| 4 | `cv_received` | CV received | The prospect returns a CV, which creates or updates a Candidate record. |

Machine values in this table are PROPOSED; the designs show labels only.

Rules:

| # | Rule |
|---|---|
| 5.1.1 | A prospect who never returns a CV never becomes a Candidate with a pipeline stage. The sourcing funnel therefore counts people the pipeline funnel cannot see. |
| 5.1.2 | Conversion is reported as a rate against invites sent, not against the previous stage, so that invite→CV is directly comparable between members. |
| 5.1.3 | Invites logged by the browser extension and invites logged manually count identically. Provenance is recorded, the metric is not split. |
| 5.1.4 | A JD shared with no CV after the JD-share SLA raises a follow-up item on the sourcer's dashboard. |
| 5.1.5 | Sourcing activity is always attributed to both a member and a requirement. Unattributed activity is not counted. |

## 5.2 Funnel B — the review-and-submit funnel

Owner: the **Profile Lead**, then the client. Measured per requirement and per
client.

| Order | Machine value | Display label | Enters when | Actor |
|---|---|---|---|---|
| 1 | `cv_received` | CV received | Hand-off from Funnel A. | Sourcer |
| 2 | `ai_screened` | AI screened | The AI screening run completes and a match score is written. | System |
| 3 | `lead_review` | Lead review | The CV enters the profile lead's review queue. | Profile Lead |
| 4 | `submitted` | Submitted to client | The lead sends the submission package to a client contact. | Profile Lead |
| 5 | `client_approved` | Approved by client | The client contact accepts the submission. | Client |
| 5a | `client_rejected` | Rejected by client | The client contact declines, with a reason. | Client |
| 6 | `interview` | Interview | An interview is scheduled against the approved submission. | Profile Lead |
| 7 | `offered` | Offered | An offer is created for the candidate on that requirement. | Agency |
| 8 | `hired` | Hired | The offer is accepted. | Agency |
| 9 | `joined` | Joined | The candidate starts, creating a Placement. | Agency |

Machine values are PROPOSED. Module 12 owns the authoritative stage and
sub-status taxonomy; this chapter names only the spine.

Rules:

| # | Rule |
|---|---|
| 5.2.1 | A CV that fails lead review is **sent back to the sourcer with a reason** rather than deleted. It leaves Funnel B and re-enters the sourcer's work list. |
| 5.2.2 | A CV marked as junk leaves both funnels and is excluded from every conversion metric, including the sourcer's invite→CV rate. |
| 5.2.3 | Only a Profile Lead (or a role holding the review-and-submit grant) may move a candidate from `lead_review` to `submitted`. A sourcer cannot submit to a client. |
| 5.2.4 | The client decision is recorded against the Submission, not against the Candidate. The same candidate may be approved by one client and rejected by another. |
| 5.2.5 | A client decision that arrives after the feedback SLA is still recorded; the SLA breach is retained on the submission for reporting. |
| 5.2.6 | Approval does not schedule anything. It creates a "call and schedule" action on the lead's dashboard. |

## 5.3 The hand-off

`cv_received` is the single joint. It is the terminal stage of Funnel A and the
entry stage of Funnel B, and it is the only point where responsibility moves
from the sourcer to the profile lead.

| # | Rule |
|---|---|
| 5.3.1 | The hand-off is an event with a timestamp, a from-member and a to-member. It is not merely a stage change. |
| 5.3.2 | Time spent in Funnel A is attributed to the sourcer; time from `cv_received` onward is attributed to the profile lead. Time-to-fill spans both. |
| 5.3.3 | A candidate added directly to the workspace — imported, referred or applied — enters at `cv_received` with no Funnel A history. Their sourcing metrics are null, not zero. |

## 5.4 Funnel vocabulary conflicts

The designs render the same underlying pipeline with four different label sets.
They are recorded here so that no chapter silently invents a fifth.

| Surface | Labels shown |
|---|---|
| Dashboard — Pipeline health | Screening · Submissions · Interview · Offer · Hired |
| Dashboard — per-requirement funnel | Candidates · Submitted · Interviews · Offers · Joined |
| Lead Dashboard — Submission funnel | CVs received · Reviewed · Submitted to client · Client approved · Interviews set |
| Employee Dashboard — My funnel | Invites sent · Connected · JD shared · CVs received |

> **Open question:** only the last of these is Funnel A; the other three are
> three renderings of Funnel B at different altitudes. PROPOSED - needs product
> sign-off: Module 00 fixes one machine spine (§5.2) and each surface declares
> which stages it merges for display, rather than each surface owning its own
> stage names.

## 5.5 The money tail

Neither funnel ends at the hire. The commercial tail is a third sequence,
triggered by the Placement.

| Order | Machine value | Display label | Trigger |
|---|---|---|---|
| 1 | `placement_created` | Placed | The candidate joins. |
| 2 | `invoice_raised` | Invoiced | The placement fee is invoiced to the client under the fee agreement in force at requirement creation. |
| 3 | `invoice_paid` | Paid | The client settles the invoice. |
| 4 | `commission_accrued` | Commission accrued | The recruiter's share is calculated against the placement fee. |
| 5 | `commission_paid` | Commission paid | The payout is released. |
| 6 | `guarantee_expired` | Guarantee cleared | The guarantee period lapses without a replacement claim. |

Rules:

| # | Rule |
|---|---|
| 5.5.1 | Commission accrues on placement but is **not payable until the client invoice is paid**. |
| 5.5.2 | If the candidate leaves inside the guarantee period, the placement enters a replacement state; accrued commission is reversed and any raised invoice is credited per the fee agreement's replacement terms. |
| 5.5.3 | Revenue reported in Analytics is invoiced fee, not accrued fee, unless the surface states otherwise. |

---

# 6. End-to-end workflow

The previous version of this chapter documented the middle of this sequence
only. The full lifecycle, with the sourcing half and the money tail restored:

```text
SET-UP
  Create workspace
      │
  Complete Get Started checklist (5 steps, §6.1)
      │
  Invite members · assign roles · set client access
      │
  Create client  →  add contacts  →  agree fee agreement
      │
  Create requirement (JD, must-have skills, guarantee, hiring period)
      │
  Assign the team: sourcer + profile lead, with a daily invite target
      │
  AI generates sourcing keywords from the JD

FUNNEL A — SOURCING (sourcer)
      │
  Send invites (extension or manual)  →  Connected
      │
  Share JD  →  nudge if no reply
      │
  CV received  ──────────── hand-off ────────────┐
                                                 │
FUNNEL B — REVIEW & SUBMIT (profile lead → client)
                                                 │
  AI screening: score, dimensions, verdict band ─┘
      │
  Lead review queue  ──► send back to sourcer (with reason)
      │                  ──► mark junk (leaves both funnels)
  Submit to client (package, masking flags, AI summary)
      │
  Client review in the portal  ──► rejected (with reason)
      │
  Approved  →  call candidate  →  schedule interview
      │
  Interview rounds + scorecards
      │
  Offer  →  accepted
      │
  Placement (join date recorded)

MONEY TAIL
      │
  Invoice raised under the fee agreement  →  ageing / reminders
      │
  Invoice paid  →  commission released to the recruiters
      │
  Guarantee period elapses  →  placement final

THROUGHOUT
  Automation rules · Notifications & digests · Audit log · Analytics
```

## 6.1 First run

A new workspace lands on a five-step Get Started checklist rather than on an
empty dashboard.

| Order | Step machine value | Display label | What it establishes |
|---|---|---|---|
| 1 | `client` | Add your first client | Company, contacts and the fee agreement. |
| 2 | `role` | Create a role & assign the team | JD, must-have skills, sourcer + profile lead. Sourcing keywords generate on save. |
| 3 | `team` | Invite your team | Employees source, profile leads review. Permissions apply immediately. |
| 4 | `ext` | Install the HirePilotX Sourcer extension | Invites auto-log against daily targets. |
| 5 | `cal` | Connect your calendar | Google or Outlook; interviews sync both ways. |

Rules:

| # | Rule |
|---|---|
| 6.1.1 | Progress is shown as `N of 5 done` with a progress bar, and persists per workspace. |
| 6.1.2 | The checklist is skippable. Skipping opens a **sample workspace** so the product is never first seen empty. |
| 6.1.3 | Completion of all five steps surfaces a "Workspace ready" state with a route to the dashboard. |
| 6.1.4 | Step order matches the dependency order in §6: a requirement cannot be created before a client exists. |

Module 36 owns the full first-run specification, including the empty-state
catalogue.

---

# 7. Entity relationship map

## 7.1 Entity catalogue

| Entity | Identified by | Belongs to | Chapter |
|---|---|---|---|
| Workspace (Agency) | slug | — | 03 |
| Member | user × workspace | Workspace | 04 |
| Role | role key | Workspace | 05 |
| Client | `CLI-######` | Workspace | 06 |
| Contact | `CON-######` | Client | 08 |
| Fee Agreement | version | Client | 06 |
| Requirement (Job) | `JOB-######` | Client | 10 |
| Assignment | member × requirement | Requirement | 10, 15 |
| Candidate | `CAN-######` | Workspace | 12 |
| Submission | candidate × requirement | Requirement | 19 |
| Interview | submission × round | Submission | 21 |
| Scorecard | interview × panellist | Interview | 22 |
| Offer | submission | Submission | 23 |
| Placement | offer | Offer | 24 |
| Invoice | `INV-YYYY-####` | Client + Placement | 24 |
| Commission | placement × member | Placement | 25 |
| Automation rule | rule id | Workspace | 31 |
| Audit event | event id | Workspace | 35 |

## 7.2 Relationships

```text
Workspace 1─* Member
Workspace 1─* Role
Workspace 1─* Client
Workspace 1─* Candidate                 (candidates are workspace-owned, not client-owned)

Client    1─* Contact
Client    1─* FeeAgreement              (versioned; one in force at a time)
Client    1─* Requirement
Client    1─* Invoice

Requirement 1─* Assignment
Assignment  *─1 Member                  (each assignment names one duty: sourcer | profileLead)
Requirement 1─* Submission

Candidate 1─* Submission                (a candidate may be submitted to many requirements)
Submission *─1 Requirement
Submission *─1 Contact                  (the client contact the package was sent to)

Submission 1─* Interview
Interview  1─* Scorecard
Submission 0─1 Offer
Offer      0─1 Placement
Placement  1─* Invoice                  (fee, plus any replacement credit note)
Placement  1─* Commission               (one row per earning member)
Member     1─* Commission

Member     *─* Client                   (the client-access list)
```

## 7.3 Submission is the join

The single most important structural correction to the previous version of this
chapter: a candidate is **not** associated with a job. A **Submission** joins
Candidate × Requirement, and through the requirement, the Client.

| # | Rule |
|---|---|
| 7.3.1 | Everything that is per-attempt hangs off the Submission, not the Candidate: pipeline stage, AI score for that requirement, masking state, client decision, interviews, offer. |
| 7.3.2 | Everything intrinsic to the person hangs off the Candidate: name, contact details, CV, skills, experience, notes, tags, owner. |
| 7.3.3 | A candidate can therefore be `client_rejected` on one requirement and `interview` on another at the same time, with no conflict. |
| 7.3.4 | Cross-client submission history is a list of that candidate's Submissions. It is visible to agency roles; it is never visible in the client portal. |
| 7.3.5 | Deleting a requirement does not delete its candidates. Its submissions are closed and the candidates remain in the workspace. |

## 7.4 Assignment is the scoping entity

A requirement carries **two named duty roles**. They are not tags; they define
who may act on the requirement and how the work is measured.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `requirementId` | reference | Yes | The requirement being staffed. |
| `memberId` | reference | Yes | An active member of the workspace. |
| `duty` | enum `sourcer` \| `profileLead` | Yes | Display labels: **Sourcer · builds the pipeline**, **Profile lead · reviews & submits**. |
| `dailyInviteTarget` | integer | No | Only meaningful when `duty` is `sourcer`. Drives the daily target metric on the employee dashboard. |
| `assignedAt` | datetime | Yes | Set on assignment; drives "assigned 2h ago by …" copy. |
| `assignedBy` | reference | Yes | The member who made the assignment. |

Rules:

| # | Rule |
|---|---|
| 7.4.1 | A requirement may have many sourcers but exactly one profile lead in force at a time. |
| 7.4.2 | Assignment grants working access to that requirement and to its candidates, even where the member's client-access list would not otherwise reach that client. |
| 7.4.3 | Removing an assignment removes working access but does not remove authorship: sourcing counters, submissions and audit entries keep the original member. |
| 7.4.4 | A profile lead's team scope is derived from assignments — they see the members working on their requirements, and no others. |

## 7.5 Fee agreement drives the money chain

| # | Rule |
|---|---|
| 7.5.1 | A Client holds a versioned Fee Agreement: fee basis (percentage of CTC, or flat), value, replacement period, payment terms. |
| 7.5.2 | A requirement captures the agreement version in force **at requirement creation**. Later amendments apply to future requirements and future invoices only; existing invoices are never restated. |
| 7.5.3 | The placement fee is computed from the requirement's captured agreement and the accepted offer's CTC. |
| 7.5.4 | Commission is a share of the placement fee, split between the earning members per the workspace rate card. |

---

# 8. Data scoping model

Three orthogonal dimensions decide whether a member can see a record. All three
must pass.

| Dimension | Source | Answers |
|---|---|---|
| Role | The member's role and its permission grants | *May this kind of user do this kind of thing?* |
| Client access | The member's client-access list (`All clients`, `Unassigned`, or a named list) | *Which clients' data may they reach?* |
| Assignment | The member's assignments on requirements | *Which specific requirements are theirs?* |

Rules:

| # | Rule |
|---|---|
| 8.1 | Role determines the action; client access and assignment determine the row set. Holding `candidates.read` does not mean reading every candidate. |
| 8.2 | Assignment can widen reach beyond the client-access list for the assigned requirement only, and only for the duration of the assignment. |
| 8.3 | An agency-wide role's client access cannot be narrowed. |
| 8.4 | A fourth, orthogonal control governs *which fields* are visible: resume-privacy masking and per-submission anonymisation. A member may be entitled to a candidate row and still see the name masked. Module 03 owns the masking levels. |
| 8.5 | The client portal is a separate identity system. A client contact never authenticates into the workspace, and workspace scoping rules do not apply to it — portal scope is "submissions sent to my client", full stop. |

---

# 9. Identifiers

| Entity | Format | Example |
|---|---|---|
| Client | `CLI-` + 6 digits | `CLI-000102` |
| Contact | `CON-` + 6 digits | `CON-000318` |
| Requirement | `JOB-` + 6 digits | `JOB-000045` |
| Candidate | `CAN-` + 6 digits | `CAN-000123` |
| Invoice | `INV-` + 4-digit year + `-` + 4 digits | `INV-2026-0007` |

Rules:

| # | Rule |
|---|---|
| 9.1 | Identifiers are per workspace, not global. |
| 9.2 | Identifiers are never reused, including after deletion. |
| 9.3 | The invoice year segment follows the fiscal year, which runs April–March. |
| 9.4 | Identifiers are user-visible, searchable and quotable in client communication. |

> **Open question:** earlier versions of this doc set used 5-digit sequences
> (`CLI-00001`); the designs use 6. This chapter follows the designs. Module 00
> must fix the width and state the roll-over behaviour past 999,999.

---

# 10. Vocabulary

Three pairs of words are used interchangeably across the designs and the code.
Until Module 00 exists, this chapter fixes usage as follows.

| Preferred term | Also seen as | Rule |
|---|---|---|
| **Requirement** | Job, Role, Opening | The entity is a Requirement. The nav item is labelled *Jobs* and the resource key is `jobs`. In client-facing and detail screens the dominant word is *role*. Use "requirement" in specification prose. |
| **Member** | Employee, User, Recruiter, Sourcer | A **Member** is a person's membership of a workspace. *Employee* and *Sourcer* are display labels for the `employee` role. *User* means an authenticated identity, which may hold memberships in several workspaces. |
| **Submission** | Association, Application | A **Submission** is the Candidate × Requirement join (§7.3). "Associating a candidate to a job" in the previous version of this chapter means creating a Submission. |
| **Client contact** | Contact, Hiring manager | The person at the client. *Hiring manager* is a job title, not a role in this system unless Module 02 makes it one. |
| **Placement** | Hire, Close | A Placement exists only once the candidate has joined. An accepted offer is not yet a placement. |

---

# 11. Design principles

- **Two funnels, one record set.** Every screen states which funnel it is
  showing. No screen silently merges them.
- **Resume-first.** The CV is the primary artefact; structured fields are
  extracted from it rather than typed.
- **AI assists, it does not decide.** Every AI output — score, keyword set,
  summary, drafted message — is advisory, attributable, and overridable by a
  named human. No stage advances on an AI verdict alone.
- **Minimal data entry.** Anything derivable (keywords from a JD, fee from an
  agreement, commission from a fee) is derived, not asked for.
- **Contextual actions.** Actions live on the record they affect. The dashboard
  is a shortcut into them, never the only route to them.
- **Consistent list grammar.** Search, filters, sort, pagination, export and
  bulk actions behave identically on every list (Module 38).
- **Reversible by default.** Destructive actions are soft, undoable, and carry a
  stated recovery window. Activity history is never deletable.
- **SLA-driven.** Waiting is a first-class state. Anything waiting on someone
  has an owner, an elapsed time, and a breach behaviour.
- **Audited.** Every state change records actor, subject, timestamp and reason,
  including actions taken by the client portal, by automation and by the API.

---

# 12. Open questions and sign-off items

| # | Question | Owner |
|---|---|---|
| 12.1 | Role model: 4 implemented vs 4 documented vs 8 designed. Which set ships? | Module 02 |
| 12.2 | Should Profile Leads see Jobs and the TOOLS group? (§4.2) | Product |
| 12.3 | Is Pipeline a nav item or a view toggle on Candidates? Is Messages in the first release? (§3.6) | Product |
| 12.4 | One machine stage spine vs four per-surface label sets. (§5.4) | Module 00 |
| 12.5 | Identifier digit width and invoice year segment. (§9) | Module 00 |
| 12.6 | Whether a requirement may have more than one profile lead over its life, and how historical submissions attribute when the lead changes. (§7.4) | Product |
| 12.7 | Whether commission reverses in full or pro-rata on a guarantee claim. (§5.5) | Module 25 |

---

# 13. Next module

Module 02 — User Roles & Permissions.
