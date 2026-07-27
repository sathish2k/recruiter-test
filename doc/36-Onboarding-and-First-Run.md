# Module 36 - Onboarding & First-Run Experience

# 1. Overview

## 1.1 Purpose

This module specifies what a HirePilotX workspace does between the moment it is created
and the moment it holds real recruitment data. It covers three things:

1. The **Get Started checklist** — a five-step guided setup, its completion conditions,
   and whether each step is observed by the system or self-attested by the user.
2. The **first-run workspace state** — persisted checklist progress, the optional sample
   workspace, the trial countdown, and the controls that are suppressed or disabled while
   the workspace is empty.
3. The **empty-state catalogue** — the exact copy and the primary action for every list,
   board column, dashboard widget and queue that can render with no rows.

## 1.2 Source authority and a blocking dependency

> **Open question:** This chapter was written against the design screens listed in §1.3.
> `00-Glossary-and-Conventions.md` and `01-Introduction-System-Overview.md` **do not exist
> in the repository**. Every enum, stage name, SLA figure, ID format, currency and fiscal
> convention in this chapter is therefore transcribed from the designs or the existing
> application code, not from the glossary. Module 00 remains authoritative: where Module 00
> is later written and disagrees with a value below, Module 00 wins and this chapter must be
> corrected. No machine value in this chapter should be treated as ratified until that
> reconciliation happens.

A concrete and material instance of the problem, which this chapter must not resolve
unilaterally — three different candidate stage vocabularies are in circulation:

| Source | Values |
|---|---|
| Pipeline board columns (design: *Pipeline First Run*) | `Sourcing`, `CV Received`, `Lead Review`, `Submitted`, `Interview` |
| Candidates list stage filter (design: *Candidates First Run*) | `Sourced`, `Screened`, `Shortlisted`, `Interviewing`, `Offer`, `Rejected` |
| Application code (`candidate-form.configuration.ts`) | `sourced`, `screening`, `submitted`, `interview`, `offer` (default `sourced`) |

> **Open question:** Which of the three is the canonical pipeline stage set? Module 00 §3
> must publish one list; the board columns, the list filter and the stored enum must then
> all derive from it. Until then this chapter quotes each surface's own labels verbatim and
> makes no claim about which is correct.

## 1.3 Design screens covered

- `AIRecruiter - Get Started.dc.html`
- `AIRecruiter - Dashboard First Run.dc.html`
- `AIRecruiter - Clients First Run.dc.html`
- `AIRecruiter - Jobs First Run.dc.html`
- `AIRecruiter - Candidates First Run.dc.html`
- `AIRecruiter - Pipeline First Run.dc.html` (board columns)
- `AIRecruiter - Interviews First Run.dc.html` (queues)
- `AIRecruiter - Placements First Run.dc.html` (queues)

## 1.4 Vocabulary used in this chapter

| Term | Meaning |
|---|---|
| First run | The period in which a workspace has never held a real record of a given entity type. Scoped per entity, not globally — a workspace can be past first run for clients and still in first run for candidates. |
| Zero state | An empty result set caused by there being no records at all. Carries instructional copy and a primary action. |
| No-results state | An empty result set caused by an active search or filter. Carries corrective copy and a clear-filters action. Never carries a create action. |
| Observed completion | A checklist step the system marks complete by detecting a data condition. The user cannot fake it and cannot revert it. |
| Self-attested completion | A checklist step the user marks complete by hand because the system cannot detect the outcome. Reversible. |
| Sample workspace | Demonstration data, clearly labelled as such, that lets a new user explore populated screens before entering real data. |

# 2. First-run lifecycle

## 2.1 Workspace onboarding state

`workspace.onboardingState` — PROPOSED, needs product sign-off.

| Machine value | Display label | Meaning |
|---|---|---|
| `not_started` | Not started | Workspace created; the Get Started screen has never been opened. |
| `in_progress` | In progress | The Get Started screen has been opened; between 0 and 4 steps are done. |
| `completed` | Completed | All five steps are done. Set once and never cleared. |
| `dismissed` | Dismissed | The user explicitly dismissed the checklist before completing it. |

Rules:

1. A workspace enters `not_started` at creation and leaves it the first time any member
   opens the Get Started screen.
2. `completed` is terminal. Reverting a self-attested step after completion does not move
   the workspace back to `in_progress`; the celebratory banner is shown once and the
   checklist entry point is retired.
3. `dismissed` is reversible — the checklist remains reachable from the Help Centre.
4. Onboarding state is a property of the **workspace**, not of the user. A second member
   joining a workspace that is already `completed` does not see the checklist.

> **Open question:** Should each new member get their own personal onboarding pass
> (extension install, calendar connect are per-user actions), separate from the
> workspace-level pass? The designs show only one workspace-level checklist. PROPOSED:
> split `ext` and `cal` into a per-user micro-checklist in a later release.

## 2.2 Entry point

- Immediately after account creation the user is routed to the Get Started screen.
- While `onboardingState` is `not_started` or `in_progress`, the checklist is reachable
  from the Help Centre and from the workspace switcher.
- Once `completed` or `dismissed`, the entry point is removed from primary navigation and
  retained only in the Help Centre.

# 3. The Get Started checklist

## 3.1 Screen content

| Element | Content | Rules/Notes |
|---|---|---|
| Heading | `Welcome, {firstName} — let's set up HirePilotX` | `{firstName}` from the signed-in user's profile. If absent, fall back to `Welcome — let's set up HirePilotX`. |
| Sub-heading | `Five steps to your first placement. Your workspace fills up as you go — {doneCount} of 5 done.` | `{doneCount}` is an integer 0–5, recomputed on every render. |
| Progress bar | Fill = `doneCount / 5` | Purely derived; not stored. |
| Skip link | `Skip — explore the sample workspace →` | Navigates to the Dashboard. Does not change `onboardingState`. See §5. |
| Completion banner | Title `Workspace ready!`, body `Your team can start sourcing — invites will show up on the dashboard live.`, action `Go to dashboard` | Rendered only when `doneCount == 5`. |
| Footer tip | `Tip: press ⌘K anywhere to jump to any screen, candidate, job or client.` | Static. |

## 3.2 Step catalogue

Step keys are transcribed from the design so that stored progress matches the design
source of truth. Step order is fixed and is not user-configurable.

| # | Key | Title | Helper text | CTA | Target |
|---|---|---|---|---|---|
| 1 | `client` | Add your first client | Company, contacts and the fee agreement | `Add client` | Clients |
| 2 | `role` | Create a role & assign the team | JD, must-have skills, sourcer + profile lead — AI keywords generate on save | `Create role` | Add Job |
| 3 | `team` | Invite your team | Employees source, profile leads review — permissions apply instantly | `Invite` | Settings |
| 4 | `ext` | Install the HirePilotX Sourcer extension | LinkedIn invites log themselves against daily targets | `See how` | LinkedIn Extension |
| 5 | `cal` | Connect your calendar | Google or Outlook — interviews sync both ways | `Connect` | Interviews |

## 3.3 Completion conditions

| Key | Completion condition | Mode | Reversible |
|---|---|---|---|
| `client` | At least one client record exists in the workspace and is not soft-deleted. | Observed | No |
| `role` | At least one requirement record exists in the workspace, in any status including `Draft`. Drafts count because sourcing keywords are generated on save. | Observed | No |
| `team` | At least one team invitation has been issued from this workspace. Acceptance is **not** required. | Observed | No |
| `ext` | The Sourcer extension has reported at least one authenticated event against this workspace. | Observed if detected, otherwise self-attested | Yes, while self-attested |
| `cal` | A calendar integration for the signed-in user is in a connected state (Google Calendar or Outlook). | Observed | No |

Rules:

1. **Observed beats attested.** If an observed condition holds, the step reads `done` and
   the manual toggle is inert. A user cannot un-tick a step whose data condition is
   satisfied.
2. **Self-attestation is permitted on any step.** The design exposes a toggle on every row.
   Ticking a step whose observed condition is not yet satisfied stores
   `completionSource = self_attested`. If the observed condition later becomes true, the
   record is upgraded to `observed` and the step becomes irreversible.
3. **Un-ticking** is allowed only for `self_attested` steps and only while
   `onboardingState != completed`.
4. Deleting the last client, requirement or invitation does **not** revert step 1, 2 or 3.
   Completion records a milestone, not a live count.
5. Completion is evaluated on checklist render and on the mutation events listed in §10.1.
   There is no polling requirement.

> **Open question:** Step 4 has CTA `See how` pointing at an explanatory screen, so the
> click itself proves nothing. PROPOSED: treat the click as advisory only and keep the step
> self-attested until an extension event arrives. Needs product sign-off.

## 3.4 Persistence

The checklist is stored, not derived, so that self-attested state survives sessions and so
that completion timestamps are auditable.

`OnboardingChecklist` — one record per workspace.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `workspaceId` | reference | Yes | Unique. One checklist per workspace. |
| `state` | enum | Yes | See §2.1. Defaults to `not_started`. |
| `firstOpenedAt` | timestamp | No | Set once, on the first render of the Get Started screen. |
| `completedAt` | timestamp | No | Set once, when `doneCount` first reaches 5. Never cleared. |
| `dismissedAt` | timestamp | No | Set when the user dismisses the checklist. Cleared if reopened. |
| `steps` | list of `OnboardingStep` | Yes | Exactly five entries, one per key in §3.2, created eagerly at workspace creation. |

`OnboardingStep`.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `key` | enum | Yes | One of `client`, `role`, `team`, `ext`, `cal`. Immutable. |
| `status` | enum | Yes | `pending` (Pending — not yet done) or `done` (Done — complete). Defaults to `pending`. |
| `completionSource` | enum | No | `observed` (system-detected) or `self_attested` (user-marked). Required when `status = done`. |
| `completedAt` | timestamp | No | Required when `status = done`. |
| `completedBy` | reference | No | The user who triggered completion. Populated for both modes. |

## 3.5 Dismissal

- Dismissing sets `state = dismissed` and `dismissedAt`. Step records are untouched.
- Dismissal is a workspace-level action and is visible to all members.
- Reopening the checklist from the Help Centre clears `dismissedAt` and returns the state
  to `in_progress` (or `not_started` if nothing has been done).

# 4. Sample workspace

The Get Started screen offers `Skip — explore the sample workspace →`, but every first-run
screen in the design set renders genuinely empty. The designs are therefore contradictory
on whether sample data exists at all.

> **Open question:** Does a sample workspace ship? The skip link promises one; the Dashboard,
> Clients, Jobs, Candidates, Pipeline, Interviews and Placements first-run screens all show
> zero states with no sample rows. Either the link copy is wrong or the first-run screens
> are drawn for the post-purge state. Product must choose before build.

The following is PROPOSED - needs product sign-off, and applies only if a sample workspace
ships.

## 4.1 Rules

1. Sample data is **read-only demonstration content**, seeded on demand when the user
   follows the skip link, never seeded automatically at workspace creation.
2. Every sample record is flagged `isSample = true` and is rendered with a persistent
   "Sample" marker on lists, detail screens and board cards.
3. Sample records are excluded from: all dashboard and list aggregates, analytics,
   commissions (Module 25), invoicing (Module 24), exports, notifications, and the
   checklist completion conditions in §3.3. Adding a sample client does **not** complete
   step `client`.
4. Sample records cannot be edited, submitted to a client (Module 19), progressed to an
   offer, or invoiced.
5. Sample data is purged automatically when the first real record of any entity type is
   created, and can be purged manually at any time from Settings.
6. Purging is irreversible and requires confirmation naming the record counts to be removed.

## 4.2 Sample workspace state

`workspace.sampleDataState` — PROPOSED.

| Machine value | Display label | Meaning |
|---|---|---|
| `absent` | Not seeded | No sample data has ever been created. |
| `present` | Sample data active | Sample records exist and are being rendered with markers. |
| `purged` | Removed | Sample data existed and has been deleted. Cannot be re-seeded. |

# 5. Trial countdown

## 5.1 Observed design

The Dashboard first-run sidebar carries a trial panel: label `Free trial`, counter
`14 days left`, a full progress bar, and a `See plans` action targeting Pricing. The
Clients first-run sidebar carries an `Upgrade Pro` promotional panel instead, with body
`Unlock unlimited AI screenings and multi-client seats` and actions `Upgrade` / `Learn More`.

> **Open question:** Two different sidebar footer panels appear on two first-run screens.
> Are these two states of one slot (trial active vs trial expired/paid) or two competing
> designs? PROPOSED: one slot, rendered per §5.3.

## 5.2 Rules

1. The trial length is **14 days**, counted from workspace creation.
2. `daysRemaining` is computed in whole days in the workspace's configured time zone, as
   `ceil(trialEndsAt - now)` floored at 0. A workspace created at any time on day 1 shows
   `14 days left` for the remainder of that calendar day.
3. The counter displays `14 days left` … `1 day left` (singular at 1), then `Trial ended`.
4. The progress bar represents remaining time, not elapsed time: full at day 14, empty at
   expiry.
5. The trial panel is visible to every member of the workspace but the `See plans` /
   `Upgrade` action is enabled only for members with billing permission (§8). For all other
   members the action is replaced by the text `Ask your workspace owner to upgrade`.
6. The trial countdown is independent of onboarding state. Completing the checklist does not
   extend, shorten or hide the trial.

## 5.3 Trial state

`workspace.trialState` — PROPOSED.

| Machine value | Display label | Meaning | Sidebar panel |
|---|---|---|---|
| `trial_active` | Free trial | `daysRemaining > 3` | Trial panel with counter |
| `trial_expiring` | Free trial ending | `daysRemaining <= 3` and `> 0` | Trial panel, counter emphasised |
| `trial_expired` | Trial ended | `daysRemaining == 0`, no paid plan | Upgrade panel |
| `subscribed` | — | A paid plan is active | No panel |

> **Open question:** What happens to the workspace at `trial_expired`? Options are
> read-only access, read-only plus export, or full lockout with a grace period. No design
> covers it. This must be specified before build; it changes the permission model in §8.

# 6. Controls suppressed or disabled during first run

State these as data-driven rules, not as per-screen exceptions.

| Rule | Condition | Behaviour |
|---|---|---|
| R1 — Export disabled on empty result sets | The current result set (after filters) contains zero rows | The Export control is rendered disabled and does not open its format menu. Observed on the Dashboard first-run screen. |
| R2 — "View all" inert | The summarised collection contains zero rows | The "View all" affordance renders in a disabled style and does not navigate. Observed on the Dashboard *Recent candidates* card. |
| R3 — Bulk action bar suppressed | No rows are selected, which is unconditionally true when no rows exist | The selection bar (`{n} selected`, `Export selected`, `Close selected`, `Clear`) is not rendered. |
| R4 — Select-all inert | The current page contains zero rows | The header select-all control renders but performs no state change. |
| R5 — SLA breach banner suppressed | No item in scope is over its stage SLA | The pipeline SLA banner is not rendered. |
| R6 — Aggregate placeholders | A numeric aggregate has no contributing records | Render `0`; render `—` where the metric is an average or a duration that is undefined rather than zero (for example *Avg Time to Hire*). Never render a computed `0` for an average. |
| R7 — Filters remain enabled | Always | Search, filter and sort controls stay interactive on empty lists. They are the only route to the no-results state and disabling them would strand a user who filtered into emptiness. |
| R8 — Creation actions never disabled | Always | Primary create actions (`+ Add Client`, `+ New Requirement`, `+ Add Candidate`, `+ Schedule interview`, `+ Record offer`) remain enabled during first run regardless of permissions-independent state. |

> **Open question:** R1 is contradicted by the Clients first-run screen, where Export is
> enabled and opens its menu over an empty list. PROPOSED: apply R1 uniformly and correct
> the Clients screen. Needs design sign-off.

# 7. Empty-state catalogue

## 7.1 Copy and action rules

1. Every empty state carries a **title**, a **body** explaining what will appear and why,
   and at most **two** actions — one primary, one secondary.
2. The primary action must be the shortest path to making the state non-empty. Where no
   such action exists for the current user, the empty state carries no action.
3. Zero states are instructional. No-results states are corrective and must offer
   `Clear all` rather than a create action.
4. Column headers, filter chips, tab labels and card chrome are **retained** in the zero
   state so that the shape of the eventual data is legible. Only the row area is replaced.
5. Tab and filter counters render `(0)` rather than being hidden.
6. Copy below is transcribed verbatim from the designs and is normative. Any change is a
   copy change requiring design sign-off, not an implementation detail.

## 7.2 Dashboard widgets

| Widget | Title / value | Empty copy | Primary action | Secondary |
|---|---|---|---|---|
| Stat card — Open Roles | `0` | `No roles yet` | Card navigates to Jobs | — |
| Stat card — Active Candidates | `0` | `Nothing sourced` | Card navigates to Candidates | — |
| Stat card — Hires This Month | `0` | `Your first is coming` | Card navigates to Placements | — |
| Chart — Candidates Sourced | `0` | `No sourcing activity yet` / `Your team's invites and connections will chart here once sourcing begins.` | None | — |
| Table — Recent candidates | Sub-title `Nobody sourced yet` | `No candidates yet` / `Add a client and a role, then start sourcing — candidates and their AI match scores will appear here.` | `Create a role` | `Add candidate` |
| Panel — Next interview | — | `No interviews scheduled` / `Your next interview will show here with a one-tap join link.` | `Book an interview` | — |
| Panel — AI Screening | `0 screened of 200 daily quota` | Distribution bar renders empty; hint `Upload a CV and HirePilotX scores it against the role's must-haves in seconds.` | None | — |
| Panel — Upcoming Interviews | — | `Nothing scheduled` / `Interviews you book will appear here and sync to your calendar.` | The `+` header control (schedule) | — |
| Quick Action chips | — | Not an empty state. `+ Add requirement`, `Invite`, `Import` remain enabled at all times. | — | — |

Chart axis labels (`300`/`200`/`100`/`0`, `Mon`–`Sun`) and the period selector
(`This week`) are retained in the zero state.

> **Open question:** `200 daily quota` on the AI Screening panel is a plan limit. Is it
> fixed, per-plan, or per-workspace configurable? Module 00 must publish the quota
> catalogue; this chapter only records that the zero state shows `0 screened` against it.

## 7.3 Clients

| Surface | Empty copy | Primary action |
|---|---|---|
| Client list | `No clients yet` / `Add the companies you recruit for. Once a client is in, you can open roles and start sourcing candidates against them.` | `Add your first client` |
| Filter tabs | `All (0)`, `Hiring (0)`, `Paused (0)` — retained with zero counters | — |
| Search field | Placeholder `Search clients…` — retained and enabled | — |
| Stat — Active Clients | `0` / `No clients yet` | — |
| Stat — Open Roles | `0` / `No roles yet` | — |
| Stat — Avg Time to Hire | `—` / `No hires yet` | Renders `—`, not `0` (rule R6) |
| Stat — Placements YTD | `0` / `Nothing placed` | — |

## 7.4 Jobs / Requirements

| Surface | Empty copy | Primary action |
|---|---|---|
| Requirements table | `No requirements yet` / `Create your first requirement and HirePilotX auto-generates sourcing keywords from the JD so your team can start finding candidates right away.` | `Create a role` |
| Column headers | `Role`, `Client`, `Location · Type`, `Pipeline`, `AI Matched`, `Posted`, `Status` — retained and still sortable | — |
| Search field | Placeholder `Search requirements…`; scope selector `All` / `Role` / `Client` retained | — |
| Inline filters | `Role`, `Client`, `Status` chips retained and enabled | — |
| Overflow filters | `Filters` popover with groups `LOCATION`, `EMPLOYMENT TYPE`, `EXPERIENCE LEVEL` retained | — |

## 7.5 Candidates

| Surface | Empty copy | Primary action | Secondary |
|---|---|---|---|
| Candidates table | `No candidates yet` / `Source candidates from LinkedIn & Naukri, add them manually, or import a CSV. Their AI match scores and stages will show up here.` | `Add candidate` | `Import CSV` |
| Column headers | `Candidate`, `Role`, `Client`, `AI Match`, `Experience`, `Applied`, `Stage`, `Actions` — retained | — | — |
| Search field | Placeholder `Search candidates…`; scope selector `All` / `Name` / `Role` / `Client` | — | — |
| Inline filters | `Stage`, `Client`, `Role` retained | — | — |
| Overflow filters | Groups `SOURCE`, `EXPERIENCE`, `AI MATCH` retained | — | — |
| Import modal, initial step | `Drop your CSV here` / `or click to browse · up to 5,000 rows` | File chooser | — |

## 7.6 Pipeline board columns

Each column renders its own empty placeholder; there is no board-level empty state. Column
counters render `0` and the per-column `add` control remains enabled and targets Add
Candidate.

| Column | Header hint | Empty title | Empty body |
|---|---|---|---|
| `Sourcing` | `invites · connect · JD` | `Nothing in Sourcing` | `No outreach here for this filter — send LinkedIn invites to fill it.` |
| `CV Received` | `AI scored` | `Nothing in CV Received` | `CVs land here the moment a candidate shares one.` |
| `Lead Review` | `profile lead` | `Nothing in Lead Review` | `Strong CVs get forwarded here for the profile lead.` |
| `Submitted` | `with client` | `Nothing in Submitted` | `Nothing with the client right now.` |
| `Interview` | `approved` | `Nothing in Interview` | `Approved candidates show up here for scheduling.` |

Stage SLA thresholds implied by the same design, in days in stage:

| Column | SLA (days) |
|---|---|
| `Sourcing` | 7 |
| `CV Received` | 2 |
| `Lead Review` | 2 |
| `Submitted` | 3 |
| `Interview` | 5 |

The board's SLA banner summarises these as `SLA: CV 2d · Lead review 2d · Client 3d` and is
suppressed entirely during first run (rule R5). Submission to a client is covered by
Module 19.

> **Open question:** The banner names three SLAs; the board applies five. Module 00's SLA
> catalogue is authoritative and must reconcile the `Sourcing` (7d) and `Interview` (5d)
> thresholds, which appear nowhere else.

## 7.7 Interviews

| Surface | Empty copy | Primary action |
|---|---|---|
| View tabs | `Today (0)`, `This week (0)`, `Past` — retained with zero counters | — |
| Today timeline | `No interviews today` / `When you book interviews they show up on this timeline with one-tap join links.` | `Schedule interview` |
| Upcoming this week | `Nothing scheduled this week` / `Approved candidates you schedule will appear here and sync to your calendar.` | `Schedule interview` |
| Past interviews | `No past interviews` / `Completed interviews and their scorecards will be archived here.` | None |
| Week calendar | Each day column renders with counter `—` and no items. Day headers retained. | — |
| Queue — Needs scheduling | Card sub-title `Client-approved candidates land here to call or send a self-schedule link`. Empty: `Nobody waiting yet` / `Once a client approves a candidate, they show up here to book.` | None |
| Queue — Feedback pending | Card sub-title `Click to fill the scorecard`. Empty: `No feedback pending` / `Scorecards appear here after interviews finish.` | None |
| Panel — Calendar sync | Not an empty state. Rows `Google Calendar` and `Outlook`, each showing `Connect` or `Connected ✓`, with footnote `Invites, reschedules and cancellations sync both ways.` | `Connect` (also completes checklist step `cal`, §3.3) |

The timeline header retains its date and time-zone note (`all times in IST (GMT+5:30)` in
the design) in the zero state.

> **Open question:** The time-zone note is hard-coded to IST in the design. Module 00 must
> publish the workspace time-zone convention; this chapter assumes the note renders the
> workspace's configured zone.

## 7.8 Placements

| Surface | Value / copy | Primary action |
|---|---|---|
| KPI — Offers out | `0` / `None yet` | — |
| KPI — Accepted — joining | `0` / `None yet` | — |
| KPI — Placements YTD | `0` / `No placements` | — |
| KPI — Fees this quarter | `$0` / `No fees yet` | — |
| Offers table | `No offers yet` / `When a client makes an offer, record it here to track fees, invoices and the placement guarantee.` | `Record offer` |
| Offers column headers | `Candidate`, `Role · Client`, `Offer CTC`, `HirePilotX fee (20%)`, `Invoice`, `Status` — retained | — |
| Upcoming joins | `No upcoming joins` / `Accepted candidates with a start date will appear here with a countdown to their joining day.` | None |
| Right rail — revenue | `No revenue yet` / `Fees by client, invoices and the guarantee watch will appear here after your first placement.` | None |
| Right rail — explainer | `How fees work`: fee calculated at the client's contracted rate when an offer is recorded, invoice raised on the joining date, 90-day replacement guarantee tracked automatically. Rendered in all states, not only when empty. | — |

Placements, fees and invoices are specified in Module 24; commission derivation from those
fees is specified in Module 25. This chapter specifies only their zero states.

> **Open question:** `Fees this quarter` implies a fiscal quarter and the KPI renders `$0`,
> implying USD. `Placements YTD` implies a fiscal year. Module 00 owns the fiscal calendar
> and the workspace currency; the `(20%)` in the offers column header is a per-client
> contracted rate and must not be hard-coded into the header once real clients exist.

## 7.9 Surfaces not covered by the design set

The following surfaces can render empty but have no first-run design: Contacts, Analytics,
Commissions, AI Screening, Automation, Team Activity, Notifications, Integrations, and the
Client Portal.

> **Open question:** Each needs a zero state authored to the rules in §7.1 before build.
> PROPOSED: Commissions and Analytics should point at Module 24 and Module 25 respectively
> for the record type that must exist first, rather than offering a create action they
> cannot fulfil.

# 8. Permissions

Role names below are the display labels used by the designs. Machine role values are owned
by Module 00.

| Capability | Rule |
|---|---|
| View the Get Started checklist | Any member of a workspace whose `onboardingState` is `not_started` or `in_progress`. |
| Complete step `client` / `role` | Requires create permission on clients / requirements respectively. A member without the permission sees the step and its helper text, with the CTA disabled. |
| Complete step `team` | Requires permission to invite members. |
| Complete step `ext` / `cal` | Any member. These are per-user actions. |
| Dismiss the checklist | Workspace owner or administrator only. Dismissal affects all members. |
| Seed or purge sample data | Workspace owner or administrator only. |
| Act on the trial panel | Counter visible to all members; `See plans` / `Upgrade` enabled only for members with billing permission (§5.2 rule 5). |
| See an empty state's primary action | The action is rendered only if the user could actually perform it. A member without create permission sees the zero-state title and body with no action, never a disabled create button. |

> **Open question:** Does an Employee (sourcer) see the workspace-level checklist at all, or
> only a reduced sourcing-focused variant? The designs show one checklist and do not
> distinguish. PROPOSED: show the full checklist, disable CTAs the member cannot perform.

# 9. Cross-module dependencies

| Depends on | For |
|---|---|
| Module 00 §3 | Pipeline stage enum, SLA catalogue, ID formats, currency and fiscal calendar. Blocking — see §1.2. |
| Module 01 | Entity map and module numbering. |
| Module 19 | Definition of a client submission; the `Submitted` board column's zero state. |
| Module 24 | Placements, offers, invoices, the 90-day guarantee; the Placements zero states in §7.8. |
| Module 25 | Commissions; the Commissions zero state noted as outstanding in §7.9. |

# 10. Events

## 10.1 Checklist re-evaluation triggers

Checklist step conditions are evaluated on the Get Started screen render and on each of the
following events:

| Event | Re-evaluates |
|---|---|
| Client created | `client` |
| Requirement created (including `Draft`) | `role` |
| Team invitation issued | `team` |
| Sourcer extension event received | `ext` |
| Calendar integration connected | `cal` |

## 10.2 Emitted events

| Event | Payload | Purpose |
|---|---|---|
| `onboarding.step.completed` | `workspaceId`, `key`, `completionSource`, `completedBy`, `completedAt` | Analytics; drives the completion banner. |
| `onboarding.completed` | `workspaceId`, `completedAt`, elapsed time since workspace creation | Time-to-value measurement. |
| `onboarding.dismissed` | `workspaceId`, `dismissedAt`, `doneCount` at dismissal | Identifies which step users abandon on. |
| `sample_data.seeded` / `sample_data.purged` | `workspaceId`, record counts | Ensures sample records are excluded from reporting. |

# 11. Open questions and sign-off items

Consolidated for product review. Each is stated in context above.

1. Module 00 and Module 01 do not exist; every enum here is provisional (§1.2).
2. Three competing candidate stage vocabularies must be reconciled (§1.2).
3. Per-user versus per-workspace onboarding for `ext` and `cal` (§2.1).
4. Whether the `See how` click on step `ext` may count as completion (§3.3).
5. Whether a sample workspace ships at all, given the skip link contradicts every first-run
   screen (§4).
6. Whether the sidebar footer has one slot with two states or two competing designs (§5.1).
7. Behaviour of the workspace at trial expiry (§5.3).
8. Whether Export is disabled on empty lists uniformly (§6, rule R1).
9. Whether the AI screening daily quota is fixed, per-plan or configurable (§7.2).
10. Reconciliation of the three-SLA banner with the five board-column SLAs (§7.6).
11. Workspace time-zone convention behind the hard-coded IST note (§7.7).
12. Fiscal calendar, workspace currency, and per-client fee rate in the offers header (§7.8).
13. Zero states for the nine surfaces with no first-run design (§7.9).
14. Whether Employees see the full checklist or a reduced variant (§8).

---

> **Open question:** The successor chapter is not fixed. The pointer below is PROPOSED -
> needs product sign-off against the module index in Module 01.

Next: Module 37 - Help Centre & In-Product Support
