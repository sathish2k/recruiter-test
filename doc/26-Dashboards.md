# Module 26 - Dashboards (Owner / Lead / Employee)

> **Open question:** `doc/00-Glossary-and-Conventions.md` and
> `doc/01-Introduction-System-Overview.md` do not exist in this repository at the
> time of writing, so this chapter could not be reconciled against them. Every
> machine value quoted below is taken from the implemented data model
> (`apps/api/src/models/`, `packages/types/src/index.ts`,
> `packages/modules/recruit-candidate/src/candidate-form/candidate-form.configuration.ts`)
> or from the design screens named in §1.6. Where a design uses a label with no
> machine value behind it, that is called out. **Module 00 remains authoritative**
> — if any enum, stage name, SLA figure, ID format, currency or fiscal-calendar
> rule below disagrees with Module 00, Module 00 wins and this chapter must be
> corrected, not Module 00.

---

# 1. Overview

## 1.1 Purpose

The dashboard is the landing screen after sign-in. It is not a report. Its job is
to tell the signed-in user, in one screen, **what is behind, what is waiting on
them, and what to do next** — and to hand them a one-click route into the record
that needs the action.

There is one dashboard *route*, not three. The engine resolves which dashboard
**variant** to render from the signed-in user's role, and every widget on that
variant is then scoped by that user's data scope (§3).

## 1.2 Variants

| Machine value | Display label | Rendered for | Chapter section |
|---|---|---|---|
| `owner_dashboard` | Dashboard | Agency-wide roles (`admin`; `owner`/`admin` in the target model) | §5 |
| `lead_dashboard` | Dashboard | `lead` (`profileLead` in the target model) | §6 |
| `employee_dashboard` | Dashboard | `employee` (`recruiter` in the target model) | §7 |
| `client_dashboard` | Dashboard | `client` | Out of scope — client portal is a separate module |

All four variants use the same page title (`Dashboard`) and the same route. The
variant is never shown to the user as a label.

## 1.3 Role naming

The designs, the implemented code and the agreed target permission model use
three different names for the same three roles. This chapter uses the **machine
values currently in the code** and maps them here once.

| Design screen wording | Implemented `UserRole` | Target model role | Dashboard variant |
|---|---|---|---|
| "Agency owner" | `admin` | `owner` | `owner_dashboard` |
| (not shown) | `admin` | `admin` | `owner_dashboard` |
| "Profile Lead" | `lead` | `profileLead` | `lead_dashboard` |
| "Employee (Sourcer)" / "Sourcer" | `employee` | `recruiter` | `employee_dashboard` |
| (not shown) | `client` | `client` | `client_dashboard` |

> **Open question:** the target model splits `owner` from `admin`, but the designs
> show only one agency-wide dashboard. PROPOSED - needs product sign-off:
> `owner` and `admin` share `owner_dashboard`; the only difference is that
> billing-derived widgets (trial banner, seat count, upgrade card) are visible to
> `owner` and read-only for `admin`, per the `billing.*` keys.

## 1.4 What is common to all variants

Every variant is built from the same four widget families:

1. **KPI cards** — a single number, an optional delta, and an optional
   secondary line. Always clickable through to the filtered list that produced it.
2. **Trend widgets** — a bucketed series over a selectable period.
3. **Queues** — an ordered, actionable list. Acting on a row mutates a record and
   removes the row from the queue.
4. **Feeds** — read-only, reverse-chronological (activity, AI notes, decisions).

## 1.5 What a dashboard must never do

- It must never show a record the user is not permitted to open (§3, §11).
- It must never be the only place an action exists. Every queue action must also
  exist on the record's own screen.
- It must never block first paint on a computed aggregate. Aggregates that are
  not ready render as loading, not as `0` (§9.5).

## 1.6 Source screens

`AIRecruiter - Dashboard`, `AIRecruiter - Lead Dashboard`,
`AIRecruiter - Employee Dashboard`, `AIRecruiter - Dashboard First Run`.

---

# 2. Landing rules

| # | Rule |
|---|---|
| 2.1 | After a successful sign-in the user is sent to the dashboard route. No role lands anywhere else by default. |
| 2.2 | The dashboard route carries the authentication guard. An unauthenticated request is redirected to login on the server, before any aggregate is computed. |
| 2.3 | The variant is resolved server-side from the verified token's role claim. It is never chosen from a query parameter, a client preference, or a stored setting. |
| 2.4 | A user whose role is unknown or no longer provisioned is signed out rather than shown a default dashboard. |
| 2.5 | If the user's role permits the dashboard resource but every widget on the variant is permission-denied, the variant still renders, showing only the greeting and the empty-state guidance (§9.4). |
| 2.6 | Deep links into a dashboard widget's target (e.g. a filtered candidate list) are ordinary module routes and are guarded by that module, not by this one. |

Access to the dashboard itself is the `dashboard` resource with action `read`.
It is granted to `admin`, `lead`, `employee` and `client` by default.

## 2.7 Role preview

The Lead and Employee screens both render a **preview banner** when an agency-wide
user is impersonating a role to check what that role can see.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `previewing` | boolean | Yes | True only when an agency-wide user has entered role preview. |
| `previewSubjectName` | string | Yes when `previewing` | Display name of the previewed member. |
| `previewSubjectRole` | enum `UserRole` | Yes when `previewing` | Rendered with the display label from §1.3. |
| `previewSubjectClients` | string[] | No | Client names the previewed member can reach; omitted when unrestricted. |
| `exitPreviewTarget` | route id | Yes when `previewing` | Returns to workspace settings. |

Rules:

- Preview is **read-only**. Every queue action, bulk action and mutation on a
  previewed dashboard is disabled; the widgets render, the buttons do not fire.
- Preview requires `members.view`. It does not grant the previewed role's
  permissions to the previewer for any other purpose.
- Preview state is not persisted across sessions.

> **Open question:** the designs show preview on the Lead and Employee dashboards
> only. Whether preview is offered for `client` — where the data-isolation
> boundary is hardest — is unresolved. PROPOSED - needs product sign-off: yes,
> because previewing a client is the only way to verify isolation, and read-only
> preview cannot leak into the client's own session.

---

# 3. Data scope

Scope is enforced in the service layer as a query predicate, never as a UI
filter. A widget that cannot be scoped is not rendered.

## 3.1 Scope levels

| Machine value | Display label | Meaning |
|---|---|---|
| `agency` | Whole agency | Every record belonging to the signed-in user's agency. |
| `client_set` | Assigned clients | Records whose client is in the user's assigned client set. |
| `assigned` | Assigned to me | Records where the user is the owner, sourcer or assignee. |
| `own_client` | My organisation | Client-portal scope. Out of scope for this chapter. |

## 3.2 Scope by variant

| Variant | Default scope | Notes |
|---|---|---|
| `owner_dashboard` | `agency` | The agency boundary is absolute: an agency never sees another agency's records under any circumstance. |
| `lead_dashboard` | `client_set` | The lead's assigned clients. Every KPI, queue, funnel and feed is filtered to that set. |
| `employee_dashboard` | `assigned` | The jobs/requirements assigned to that employee, plus the candidates they sourced. |
| `client_dashboard` | `own_client` | Hard isolation. |

## 3.3 Rules

| # | Rule |
|---|---|
| 3.3.1 | `agencyId` is read from the verified token, never from the request body or a query parameter. |
| 3.3.2 | Widening scope is impossible from the dashboard. There is no "show all" toggle on the Lead or Employee variant. |
| 3.3.3 | A lead's **By sourcer** table (§6.8) is a deliberate exception to `assigned`: it aggregates other members' figures, but only within the lead's `client_set`, and only when the lead holds `members.view`. |
| 3.3.4 | An employee never sees another employee's figures, individually or aggregated, except as an anonymised team benchmark (§7.8). |
| 3.3.5 | Counts must never leak an out-of-scope record's existence. A widget's number and the list it drills into must be produced by the same predicate, so the count always equals the number of rows the user can open. |
| 3.3.6 | Where a user holds more than one scope-relevant assignment (e.g. a lead who also sources), the union applies, deduplicated by record id. |

> **Open question:** the Lead design states the lead's client access is
> "Nortech · Vantor", yet its CV review queue contains a Fablio row and its
> Client-decisions card contains a Fablio approval. Either the lead's client set
> in the mock is stale, or a lead can also review CVs for roles they were
> individually assigned outside their client set. PROPOSED - needs product
> sign-off: the lead's queue is `client_set` **∪** roles where the lead is named
> reviewer, per 3.3.6.

---

# 4. Concepts and enums used across all three variants

## 4.1 Candidate pipeline stage

Stages as implemented on the candidate record (`startingStage`, and the stage the
candidate currently occupies):

| Machine value | Display label | Meaning |
|---|---|---|
| `sourced` | Sourced | Identified; no screening done. |
| `screening` | Screening | Under internal review (recruiter or AI). |
| `submitted` | Submitted | Sent to the client; awaiting a client decision. |
| `interview` | Interview | At least one interview scheduled or held. |
| `offer` | Offer | An offer is out or under negotiation. |

Candidate lifecycle status, which is orthogonal to stage:

| Machine value | Display label | Meaning |
|---|---|---|
| `new` | New | Created, not yet worked. |
| `active` | Active | In play on at least one requirement. |
| `placed` | Placed | Joined. Terminal, positive. |
| `on_hold` | On hold | Paused by candidate, client or agency. |
| `rejected` | Rejected | Terminal, negative. |

> **Open question:** the Owner design's pipeline funnel ends in a stage labelled
> "Hired", and its requirement funnel ends in one labelled "Joined", but no such
> stage exists — the data model expresses it as `status = "placed"`. The two
> designs also disagree with each other. PROPOSED - needs product sign-off: there
> is no sixth stage; both labels render `status = "placed"` and the canonical
> display label is **Placed**. Module 00 §3 must settle this before any funnel is
> built.

> **Open question:** the Owner pipeline funnel omits `sourced` and starts at
> `screening`, whereas the Owner requirement funnel starts at a bucket labelled
> "Candidates". PROPOSED - needs product sign-off: both funnels start at
> `sourced`, displayed as **Sourced**.

## 4.2 Job status

| Machine value | Display label | Meaning |
|---|---|---|
| `open` | Open | Actively recruiting. |
| `on_hold` | On hold | Paused by the client. |
| `filled` | Filled | All openings placed. |
| `closed` | Closed | Cancelled or expired without placement. |

## 4.3 SLA state

Used by the Owner SLA widget (§5.7) and by every urgency chip in the priority
queues.

| Machine value | Display label | Meaning |
|---|---|---|
| `on_track` | On track | Clock running, due date in the future by more than one working day. |
| `due_today` | Due today | Due date falls on the current working day in the user's timezone. |
| `overdue` | Overdue | Due date has passed and the obligation is unmet. |
| `met` | Met | Closed within the deadline. Not counted in the widget. |
| `breached` | Breached | Closed after the deadline. Not counted in the widget. |
| `paused` | Paused | Clock stopped (e.g. job `on_hold`). Not counted in the widget. |

Rules:

| # | Rule |
|---|---|
| 4.3.1 | The SLA widget counts only **open** obligations, i.e. states `on_track`, `due_today` and `overdue`. The three counts are mutually exclusive and sum to the total open obligations in scope. |
| 4.3.2 | Which obligations exist, what starts and stops each clock, and each deadline in working days are defined once in **Module 00 (SLA catalogue)**. This module consumes them and defines no deadlines of its own. |
| 4.3.3 | "Today" and "working day" resolve in the signed-in user's timezone, using the agency's working-day calendar. |
| 4.3.4 | A `paused` obligation is excluded from all three counts and does not accrue elapsed time. |

> **Open question:** the Owner design shows `32 / 5 / 2` with no legend saying
> *which* obligations are being counted. Until Module 00's catalogue exists, the
> widget's denominator is undefined. PROPOSED - needs product sign-off: count
> every open obligation of every SLA type in scope, and expose the per-type
> breakdown on hover and on the drill-through.

## 4.4 Trend metric

Selectable on the Owner trend chart (§5.5).

| Machine value | Display label | Counted event |
|---|---|---|
| `invites` | Invites sent | One logged outreach invitation. |
| `submissions` | Submissions | One candidate submitted to a client. See Module 19. |
| `interviews` | Interviews booked | One interview created, counted at booking time, not at occurrence. |
| `placements` | Placements closed | One candidate reaching `status = "placed"`. |
| `revenue` | Fee revenue | Placement fee recognised, in the agency's currency. |

## 4.5 Trend period

| Machine value | Display label | Bucket | Buckets shown |
|---|---|---|---|
| `weekly` | Weekly | One calendar day | Trailing 12 days, oldest first |
| `monthly` | Monthly | One ISO week | Trailing 12 weeks, oldest first |

Rules:

| # | Rule |
|---|---|
| 4.5.1 | The bucket series is a **trailing window**; the headline total beside the chart title is the **current calendar period** (current week for `weekly`, current month for `monthly`). These are deliberately different numbers and the label must say which ("312 this week", "1,184 this month"). |
| 4.5.2 | The tallest bucket in the window is highlighted and labelled with its value. Ties resolve to the earliest bucket. |
| 4.5.3 | Individual bucket values are hidden by default and revealed by a toggle. |
| 4.5.4 | An all-zero series renders the empty state, not twelve zero-height bars (§9.5). |

> **Open question:** the Owner design labels the twelve `weekly` buckets
> Mon–Sun then Mon–Fri, which is a trailing 12 *days*, but the headline reads
> "this week". 4.5.1 above is the PROPOSED reconciliation - needs product
> sign-off.

## 4.6 Priority urgency

Used by the Owner priority queue (§5.10) and by every queue chip.

| Machine value | Display label | Meaning |
|---|---|---|
| `overdue` | Overdue | An SLA obligation on the underlying record is `overdue`. |
| `urgent` | Urgent | Not yet overdue but breaches within the current working day if untouched. |
| `today` | Today | Scheduled to happen today. |
| `queued` | Queued | Ready to be worked, no deadline pressure. |

Ordering is `overdue` → `urgent` → `today` → `queued`, then by ascending due
time, then by descending record age.

## 4.7 Currency and number formatting

| # | Rule |
|---|---|
| 4.7.1 | Monetary figures render in the agency's configured currency using the workspace's locale, per Module 00. |
| 4.7.2 | The fiscal calendar used by "this month" / "this quarter" comparisons is the agency's fiscal calendar, per Module 00 — not the Gregorian calendar, unless they coincide. |
| 4.7.3 | Counts above 999 use the locale's thousands grouping. Notification badges cap at `99+`. |

> **Open question:** the Owner design formats the revenue metric in Indian
> lakhs ("₹4.2 L this week"). Whether lakh/crore abbreviation is a
> currency-driven rule, a locale-driven rule, or an agency setting is
> unresolved and belongs in Module 00.

---

# 5. Owner / Admin dashboard (`owner_dashboard`)

Scope: `agency`.

## 5.1 Layout regions

| Region | Contents |
|---|---|
| Greeting strip | Personal greeting plus today's counters (§5.2) |
| KPI row | Three KPI cards (§5.3) |
| AI daily insight | One sentence plus one action (§5.4) |
| Trend chart | Metric tabs, period toggle, 12 buckets (§5.5) |
| Insight row | Pipeline health (§5.6), SLA status (§5.7), AI recommendations (§5.8) |
| Recent candidates | Table (§5.9) |
| Right rail | Next interview, priorities, upcoming interviews, activity (§5.10–§5.13) |

## 5.2 Greeting strip

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `greeting` | enum | Yes | `morning` before 12:00, `afternoon` 12:00–16:59, `evening` from 17:00, in the user's timezone. |
| `firstName` | string | Yes | From the user's profile. |
| `interviewsToday` | integer | Yes | Interviews in scope with a start time in the current day, excluding cancelled. |
| `submissionsPending` | integer | Yes | Submissions in scope awaiting a client decision, any age. |
| `resumesToReview` | integer | Yes | Candidates in scope at stage `screening` with no review recorded. |
| `clientsOverdue` | integer | Yes | Distinct clients in scope with at least one `overdue` SLA obligation. |

Each counter is a link to the corresponding filtered list. A counter of `0` is
hidden rather than shown as "0" — the strip is a call to action, not a report.

## 5.3 KPI cards

| Card | Value | Delta | Secondary line | Drill-through |
|---|---|---|---|---|
| **Open roles** | Count of jobs in scope with `status = "open"`. | Count of jobs in scope created since the start of the current week. Rendered as `+N`, suppressed at zero. | "N opened this week" — the same figure as the delta. | Jobs list filtered to `status = "open"`. |
| **Active candidates** | Count of distinct candidates in scope with `status` in (`new`, `active`). | Percentage change against the same measure at the close of the previous month, rounded to whole percent. | "vs last month". | Candidates list filtered to the same statuses. |
| **Submissions** | Count of submissions in scope created in the current week. | Percentage change against the previous full week. | "N awaiting client review" — submissions awaiting a client decision, **all-time**, not week-bounded. | Submissions list (Module 19). |

Rules:

| # | Rule |
|---|---|
| 5.3.1 | The delta and the secondary line on a card may be over different windows; the label must state the window in every case. |
| 5.3.2 | A percentage delta against a zero baseline renders as "—", never as `+∞` or `+100%`. |
| 5.3.3 | Deltas are green when the direction is favourable for that metric and amber/red otherwise; direction is a property of the metric, not of the sign (a rising "overdue" count is unfavourable). |
| 5.3.4 | Every card is a link. The list it opens must return exactly the counted records (3.3.5). |

> **Open question:** the populated Owner design shows **Open roles / Active
> candidates / Submissions**, while the first-run Owner design shows **Open Roles
> / Active Candidates / Hires This Month**. The third card differs. PROPOSED -
> needs product sign-off: the third card is **Submissions** in both states, since
> a first-run agency has neither submissions nor hires and the empty copy works
> for both; "Hires this month" moves to the Analytics module.

## 5.4 AI daily insight

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `insightText` | string | Yes | One sentence, generated daily against the agency's current state. |
| `actionLabel` | string | No | Present only when a concrete action exists. |
| `actionTarget` | route id + params | No | Required when `actionLabel` is present. |
| `generatedAt` | timestamp | Yes | Used to decide staleness. |

Rules:

- Exactly one insight is shown. There is no carousel and no list.
- The insight is regenerated at most once per user per day; it does not
  recompute on every page load.
- If generation fails or the agency has too little data, the whole widget is
  omitted — it is never shown with placeholder text.
- The insight must be **derivable and checkable**: every claim it makes must
  correspond to a figure the user can reach by following `actionTarget`.

## 5.5 Trend chart

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `metric` | enum §4.4 | Yes | Default `invites`. Selected via tabs. |
| `period` | enum §4.5 | Yes | Default `weekly`. Toggles between the two values. |
| `buckets` | array of `{ label, value }` | Yes | Exactly 12 entries, oldest first. |
| `headlineTotal` | number | Yes | Current calendar period total, per 4.5.1. |
| `showValues` | boolean | Yes | User toggle; not persisted. |

Rules:

| # | Rule |
|---|---|
| 5.5.1 | The `revenue` metric tab is visible only to users holding `commissions`/`billing` read access. Hiding the tab must also exclude the metric from the export. |
| 5.5.2 | The metric and period selections are view state. They are not persisted across sessions and do not appear in the URL. |
| 5.5.3 | Every metric renders over both periods; there is no metric-specific period restriction. |

## 5.6 Pipeline health

An area funnel across the candidate stages with a conversion figure between each
adjacent pair.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `stages` | array of `{ stage, count }` | Yes | One entry per stage in §4.1, in stage order. `count` is the number of distinct candidates in scope **currently occupying** that stage. |
| `conversion[i]` | percentage | Yes for all but the last stage | `stages[i+1].count ÷ stages[i].count`, rounded to whole percent. Renders "—" when the denominator is zero. |
| `stallAlert` | object | No | Present when the stall rule fires. |

Stall rule:

| # | Rule |
|---|---|
| 5.6.1 | A stage is **stalled** when at least `stallThreshold` candidates have sat in it, untouched, for at least `stallDays`. |
| 5.6.2 | "Untouched" means no stage change, note, task or communication recorded against the candidate. |
| 5.6.3 | At most one stall alert is shown — the stage with the largest stalled count; ties resolve to the earliest stage. |
| 5.6.4 | The alert links to that stage's candidate list, pre-filtered to the stalled subset. |

> **Open question:** the design hard-codes the stall alert as "6 CVs untouched
> for 3+ days". PROPOSED - needs product sign-off: `stallDays = 3` and
> `stallThreshold = 5`, both agency-configurable in workspace recruitment
> defaults rather than fixed in code.

> **Open question:** this funnel computes **step-to-step** conversion, while the
> Lead funnel (§6.7) and Employee funnel (§7.8) compute every rate against the
> **top of funnel**. Both are defensible, but showing both in one product will
> confuse users. PROPOSED - needs product sign-off: adopt step-to-step everywhere
> and additionally label the top-of-funnel rate on the final stage only.

## 5.7 SLA status

Three counts, per §4.3: `on_track`, `due_today`, `overdue`.

| # | Rule |
|---|---|
| 5.7.1 | Each count links to the obligation list filtered to that state. |
| 5.7.2 | The `overdue` count is always rendered, even at zero, because zero is the meaningful reassurance. `on_track` and `due_today` are also always rendered so the three read as a set. |
| 5.7.3 | Counts recompute on read against the current clock; they are not snapshotted at start of day. |

## 5.8 AI recommendations

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `readyCount` | integer | Yes | Candidates in scope that have been AI-scored at or above the agency's match threshold **and** have had no human decision recorded. |
| `averageMatch` | percentage | Yes | Arithmetic mean of the match scores of exactly the `readyCount` candidates, rounded to whole percent. |
| `reviewTarget` | route id | Yes | AI screening list, pre-filtered to the same set. |

Rules:

- `averageMatch` is the mean over the recommended set only — never over all
  scored candidates, and never over all candidates.
- The widget is hidden entirely for users without AI access.
- When `readyCount` is zero, the widget renders its own "nothing to review"
  state rather than "0 candidates ready".

## 5.9 Recent candidates table

Columns: Candidate, Role, Client, AI Match, Interview, Owner, Status.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `candidateName` | string | Yes | With initials avatar. |
| `role` | string | Yes | The requirement's title. |
| `client` | string | Yes | Client name. Never shown to a user outside that client's scope. |
| `aiMatch` | percentage | No | Blank when the candidate has not been scored. Not "0%". |
| `nextInterview` | datetime | No | Renders "—" when none is scheduled. |
| `owner` | user reference | Yes | The agency member accountable for the candidate. |
| `status` | enum | Yes | See rule 5.9.3. |

Rules:

| # | Rule |
|---|---|
| 5.9.1 | Rows are the most recently updated candidates in scope, capped at a fixed row count. The table is a preview, not a paginated list; "View all" opens the full candidates module. |
| 5.9.2 | The header sub-line reports two figures over the current week: candidates added, and candidates at stage `interview`. |
| 5.9.3 | The status column mixes stages and lifecycle statuses in the design ("Shortlisted", "Screening", "Rejected"). Only §4.1's machine values may be stored. "Shortlisted" has no machine value. |
| 5.9.4 | Free-text search filters on candidate name, role and client. Status filter is multi-select. Both are client-side over the previewed rows only, and must say so — they do not search the whole database. |

> **Open question:** "Shortlisted" appears as a status in the Owner table and in
> its filter, with no corresponding stage or status in the data model. PROPOSED -
> needs product sign-off: it is the display label for stage `screening` where a
> positive internal decision has been recorded, i.e. a decision flag on the
> candidate rather than a new enum member. Module 00 §3 must confirm.

## 5.10 Right rail — scope toggle

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `railScope` | enum `today` \| `week` | Yes | Default `today`. Applies to every rail widget simultaneously. |

## 5.11 Next interview

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `interview` | reference | No | The soonest interview in scope whose start time is in the future. |
| `countdown` | duration | Yes when present | Relative, recomputed on the client ("in 45 min"). Switches to an absolute time beyond 24 hours. |
| `candidate` | reference | Yes when present | Name, role, client. |
| `window` | string | Yes when present | Day plus start–end time in the user's timezone. |
| `interviewType` | string | No | e.g. "Client panel". |
| `joinTarget` | url | No | Present only when a meeting link exists. |

Actions: join the meeting, copy the invite link, open the candidate record. The
join action is disabled until the configured lead time before the start.

## 5.12 Today's priorities

The Owner action queue. Each item is generated, not authored.

| Machine value | Display label | Generated when | Action |
|---|---|---|---|
| `submit_candidates` | Submit | Candidates in scope are approved internally and not yet submitted to the client. | Open the submission flow (Module 19). |
| `follow_up_client` | Follow up | A client has an `overdue` decision obligation. | Open the client and send a follow-up. |
| `schedule_interviews` | Schedule | Client-approved candidates have no interview booked. | Open scheduling. |
| `review_ai_matches` | Review | AI-scored candidates above threshold await a human decision. | Open AI screening. |

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `itemType` | enum above | Yes | |
| `count` | integer | Yes | Number of underlying records. |
| `subjects` | string[] | No | Named examples when the count is small enough to name them. |
| `urgency` | enum §4.6 | Yes | Drives ordering and the chip. |
| `target` | route id + params | Yes | Must open exactly the underlying records. |

Rules:

| # | Rule |
|---|---|
| 5.12.1 | The header count is the number of **open** items, not the sum of their underlying records. |
| 5.12.2 | An item disappears as soon as its underlying condition clears. Items are not dismissible — dismissing a real obligation would hide it. |
| 5.12.3 | Items are ordered by §4.6, and at most one item per `itemType` is shown; multiples are aggregated into a count. |
| 5.12.4 | An item whose target the user cannot open is not generated. |

## 5.13 Upcoming interviews and Today's activity

**Upcoming interviews** — next interviews in scope after the one in §5.11,
each with candidate, role, client, date, start time and duration. Filterable by
free text over candidate name and metadata. Respects `railScope`.

**Today's activity** — reverse-chronological feed of significant events in scope
for the current day, each with a timestamp and a one-line description. Read-only.
Events older than the current day are reachable only through the full activity
module.

| # | Rule |
|---|---|
| 5.13.1 | The activity feed is capped at a fixed number of entries; "View all" opens the team activity module. |
| 5.13.2 | An event referencing a record the user cannot open is excluded from the feed entirely — not shown with the link removed. |

---

# 6. Lead dashboard (`lead_dashboard`)

Scope: `client_set` (§3.2). The lead's job is to clear the review queue and keep
client decisions moving; the dashboard is built around those two obligations.

## 6.1 Greeting strip

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `greeting` | enum | Yes | As §5.2. |
| `cvsWaiting` | integer | Yes | Candidates in scope awaiting the lead's review. |
| `clientDecisionsOvernight` | integer | Yes | Client decisions received since the lead's previous session. |

The strip renders as one sentence. Both counters link to the widget below that
owns them.

## 6.2 KPI cards

| Card | Value | Secondary line |
|---|---|---|
| **CVs to review** | Candidates in scope awaiting lead review — the same set as the queue in §6.4. | Age of the oldest item in the queue, in whole days ("oldest 2 days"). |
| **With clients** | Candidates in scope at stage `submitted`. | Of those, how many have had no client decision recorded ("N awaiting approval"). |
| **Approved — to schedule** | Candidates in scope with a positive client decision and no interview booked. | Fixed prompt text; no computed figure. |
| **Interviews this week** | Interviews in scope starting within the current week. | Of those, how many start today. |

Rules:

| # | Rule |
|---|---|
| 6.2.1 | "CVs to review" and the queue in §6.4 must always agree. They are the same query. |
| 6.2.2 | "With clients" counts candidates, not submissions. A candidate submitted to two clients counts once per client-scoped requirement, and the card states the unit. |
| 6.2.3 | "Oldest N days" measures from the moment the item entered the review queue, not from candidate creation. |

## 6.3 The review obligation

The lead's queue is populated by the handoff defined in §7.5 — an employee
forwards a sourced CV to their lead. Once forwarded, the candidate is the lead's
obligation and the SLA clock for lead review starts (Module 00 SLA catalogue).

## 6.4 CV review queue

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `candidateName` | string | Yes | With initials avatar. |
| `role` | string | Yes | Requirement title. |
| `client` | string | Yes | |
| `age` | relative time | Yes | Time since the item entered the queue. |
| `aiScore` | percentage | No | Blank, not zero, when unscored. |
| `sourcedBy` | user reference | Yes | The employee who forwarded it. |
| `submitted` | boolean | Yes | Drives the row's action state. |

Rules:

| # | Rule |
|---|---|
| 6.4.1 | Default order is `aiScore` descending. Unscored rows sort last, not as zero. |
| 6.4.2 | Row actions are **open the CV** and **submit to client**. Submitting moves the candidate to stage `submitted`, records the submission (Module 19), notifies the client contact, and marks the row submitted. |
| 6.4.3 | A submitted row stays visible for the remainder of the session, in a submitted state, so the lead can see what they just cleared. It is absent on the next load. |
| 6.4.4 | Submission requires `submissions.submit`. Without it, the queue is read-only and only the open-CV action is offered. |
| 6.4.5 | The queue never contains a candidate outside the lead's scope (§3.3). |

### 6.4.6 Bulk submit

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `bulkThreshold` | percentage | Yes | The AI match score at or above which bulk submit applies. |
| `eligibleCount` | integer | Yes | Rows at or above `bulkThreshold` that are not yet submitted. |

Rules:

- The control's label states the threshold explicitly ("Submit all 85%+").
- Unscored rows are never eligible for bulk submit.
- When `eligibleCount` is zero the action reports that plainly and changes
  nothing.
- Each bulk submission is recorded individually, produces its own client
  notification, and is individually auditable. Bulk is a convenience over the
  single action, never a different code path.

> **Open question:** the design hard-codes the bulk threshold at 85%. PROPOSED -
> needs product sign-off: `bulkThreshold` comes from the agency's AI match
> threshold in workspace recruitment defaults, so that one setting drives both
> the AI recommendation widget (§5.8) and bulk submit.

> **Open question:** whether bulk submit should be confirmable before it fires.
> PROPOSED - needs product sign-off: yes — a confirmation listing the candidates
> and the receiving clients, because the action emails clients and cannot be
> silently undone.

## 6.5 Client decisions

Two kinds of item in one list, decided items first.

| Machine value | Display label | Meaning | Action |
|---|---|---|---|
| `approved` | Approved | Client recorded a positive decision. | Call & schedule — opens scheduling for that candidate. |
| `rejected` | Rejected | Client recorded a negative decision. | Open the candidate to record the reason and re-route. |
| `awaiting` | Awaiting client review | Submitted, no decision recorded. | Open the submission to chase. |

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `candidateName` | string | Yes | For `awaiting`, names are collapsed into one row with an overflow count. |
| `role` / `client` | string | Yes | |
| `decidedAt` | time | Yes for `approved` / `rejected` | Time of day when today, date otherwise. |
| `averageWait` | duration | Yes for `awaiting` | Mean age of the awaiting set, in days to one decimal. |

Rules:

- Decided items are listed individually and newest first. Awaiting items are
  aggregated into a single row — they are context, not tasks.
- An `approved` item disappears from this widget once its interview is booked,
  at which point it appears in §6.6.
- The widget shows only decisions received since the lead's previous session
  plus everything still awaiting; it is not a decision history.

## 6.6 Interviews today

Interviews in scope starting today, in start-time order, each with start time,
candidate, role, client and round. The next one to start carries a join action;
later ones do not until their lead time. Past interviews for the day remain
listed, visually de-emphasised, so the lead can see the day as a whole.

## 6.7 Submission funnel

Window: current week. Scope: the lead's clients.

| Step | Machine value | Counted |
|---|---|---|
| CVs received | `cvs_received` | Candidates forwarded into the lead's queue in the window. |
| Reviewed | `reviewed` | Of those, how many the lead has reviewed (submitted or rejected). |
| Submitted to client | `submitted_to_client` | Of those, how many were submitted. |
| Client approved | `client_approved` | Of those, how many the client approved. |
| Interviews set | `interviews_set` | Of those, how many have an interview booked. |

Rules:

| # | Rule |
|---|---|
| 6.7.1 | Every percentage is against **CVs received**, the top of the funnel — not against the preceding step. The label must say so. (See the open question in §5.6.) |
| 6.7.2 | Steps are cumulative and monotonically non-increasing; a later step can never exceed an earlier one. If the data would produce that, the aggregate is wrong and the widget must render an error state rather than an impossible funnel. |
| 6.7.3 | Cohort rule: a candidate is counted in every step it has reached, in the window in which it **entered the funnel**, not the window in which it reached the later step. Otherwise the percentages are meaningless. |
| 6.7.4 | The commentary line below the funnel is generated from the same figures and must not introduce a number that is not derivable from them. |

## 6.8 By sourcer

Per-employee performance within the lead's client set. Window: last 30 days.

| Column | Type | Required | Rules/Notes |
|---|---|---|---|
| `employee` | user reference | Yes | Name and initials. |
| `cvs` | integer | Yes | CVs forwarded by that employee in the window. |
| `submitted` | integer | Yes | Of those, how many the lead submitted to a client. |
| `approvalRate` | percentage | Yes | Client-accepted ÷ submitted, over the window. Renders "—" when `submitted` is zero. |

Rules:

| # | Rule |
|---|---|
| 6.8.1 | The window is stated in the widget footnote. It differs from the funnel above it (current week vs last 30 days), so both windows must be labelled. |
| 6.8.2 | Requires `members.view`. Without it the widget is omitted. |
| 6.8.3 | The table lists only employees with at least one CV in the window. It is not a roster. |
| 6.8.4 | Rows are ordered by `cvs` descending. Approval rate is coloured by band, but the widget never ranks people by a single composite score. |

---

# 7. Employee dashboard (`employee_dashboard`)

Scope: `assigned` (§3.2). The employee's dashboard is a daily-target screen: hit
the invite target, work the accepted connections, get CVs to the lead.

## 7.1 Greeting strip

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `greeting` | enum | Yes | As §5.2. |
| `invitesSentToday` | integer | Yes | Same measure as the KPI in §7.3. |
| `dailyInviteTarget` | integer | Yes | The employee's target, per §7.3. |
| `cvsReceivedToday` | integer | Yes | CVs received on assigned roles today. |
| `extensionHint` | link | No | Shown only while the browser extension is not connected for this user. |

## 7.2 Newly assigned roles

A dismissible-on-acknowledgement banner listing requirements assigned to this
employee that they have not yet opened.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `title` | string | Yes | Requirement title. |
| `client` | string | Yes | |
| `assignedAt` | relative time | Yes | |
| `assignedBy` | user reference | Yes | The lead or admin who assigned it. |
| `dailyInviteTarget` | integer | No | Per-role invite target, when set. |

Rules:

| # | Rule |
|---|---|
| 7.2.1 | The banner is present only when at least one assigned role is unacknowledged. It is never rendered empty. |
| 7.2.2 | A role is acknowledged when the employee opens it or starts sourcing on it. Acknowledgement is per user, per role. |
| 7.2.3 | Actions are **view role & keywords** and **start sourcing**. Neither changes the requirement. |
| 7.2.4 | Roles remain in the employee's "My roles" table (§7.4) whether or not they are acknowledged. The banner is an alert, not a second list. |

## 7.3 KPI cards

| Card | Value | Secondary | Rules/Notes |
|---|---|---|---|
| **Invites sent today** | Invites logged by this employee today, across all assigned roles. | Percentage of `dailyInviteTarget`, capped at 100% for the progress bar but reported uncapped in text. | Includes a manual **log an invite** action for invites sent outside the extension. |
| **Connections made** | Distinct prospects who accepted an invite, all-time on assigned roles. | Accepted today, and the acceptance rate (accepted ÷ invites sent) over the same window as the rate is labelled. | |
| **JDs shared** | Job descriptions shared with connected prospects, current day. | Of those, how many have had no reply. | |
| **CVs received** | CVs received on assigned roles, current day. | How many are AI-scored and how many are awaiting forward to the lead. | Hidden AI portion when the user has no AI access. |

Rules:

| # | Rule |
|---|---|
| 7.3.1 | `dailyInviteTarget` is per user per day; where roles carry their own targets, the user's daily target is the sum of the targets of their active assigned roles. |
| 7.3.2 | Manually logging an invite creates the same event the extension creates, is attributed to the same user, and is auditable. There is no separate "manual" counter. |
| 7.3.3 | The progress bar reaching 100% never hides the actual number; over-target is stated plainly. |
| 7.3.4 | Targets are motivational, not gates. No action anywhere in the product is blocked by an unmet target. |

> **Open question:** whether the daily invite target is set per user, per role,
> or per agency, and who may edit it. The Employee design shows both a global
> "Target 50" and per-role targets of 50 and 40. 7.3.1 is the PROPOSED
> reconciliation - needs product sign-off.

## 7.4 My roles

| Column | Type | Required | Rules/Notes |
|---|---|---|---|
| `title` | string | Yes | Requirement title; row links to the requirement. |
| `client` | string | Yes | |
| `invites` | integer | Yes | Invites this employee has logged on the role, all-time. |
| `connected` | integer | Yes | Accepted invites on the role. |
| `cvs` | integer | Yes | CVs received on the role that are new to the employee; rendered "—" at zero, not "0". |
| `nextStep` | derived string | Yes | See §7.4.1. |

A totals row reports the role count, the sums of `invites`, `connected` and
`cvs`, and the distinct clients covered.

### 7.4.1 Next step derivation

The first matching rule wins:

| Order | Condition | Rendered |
|---|---|---|
| 1 | CVs received and not yet forwarded to the lead | Forward CVs to `<lead name>` |
| 2 | JDs shared with no reply beyond the follow-up threshold | Follow up N shared JDs |
| 3 | Invites logged today below the role's daily target | Send N more invites today |
| 4 | CVs with the lead, awaiting review | Lead reviewing N CVs |
| 5 | CVs with the client, awaiting decision | Client reviewing N CVs |
| 6 | None of the above | No action text; the cell is blank |

Rules 1–3 are the employee's own obligations and are emphasised; rules 4–5 are
status, not tasks, and are de-emphasised.

> **PROPOSED - needs product sign-off:** the ladder above is inferred from the
> five sample rows in the design, which show exactly these five outcomes. The
> ordering, and the follow-up threshold in rule 2, need confirming.

## 7.5 Today's follow-ups

The employee's action queue.

| Machine value | Display label | Generated when | Action |
|---|---|---|---|
| `share_jd` | Share JD | A prospect accepted an invite and has not been sent the job description. | Share JD |
| `nudge_cv` | Nudge for CV | A JD was shared beyond the follow-up threshold with no CV received. | Message |
| `forward_cv` | Forward CV | A CV was received and not yet forwarded to the lead. | Send |

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `itemType` | enum above | Yes | |
| `subject` | string | Yes | Prospect or candidate name. |
| `context` | string | Yes | Role, client, and the age of the triggering event. |
| `aiScore` | percentage | No | Shown on `forward_cv` when the CV has been scored. |

Rules:

| # | Rule |
|---|---|
| 7.5.1 | Items are ordered by §4.6 urgency, then by age of the triggering event, oldest first. |
| 7.5.2 | Completing `forward_cv` hands the candidate to the lead's queue (§6.4) and starts the lead-review SLA clock. It is the single handoff between the two dashboards. |
| 7.5.3 | Items clear when their condition clears. They are not manually dismissible. |
| 7.5.4 | An item is never generated for a role the employee is no longer assigned to; unassignment removes the items with the assignment. |

## 7.6 AI activity on my roles

A read-only feed of AI events on the employee's assigned roles.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `severity` | enum `done` \| `flag` | Yes | `done` = AI completed work; `flag` = AI is warning about pace or quality. |
| `text` | string | Yes | One line. Every number in it must be reachable from a widget on this screen. |
| `target` | route id | No | Where the event's records live. |

The whole widget is hidden for users without AI access. It shows the current day
only.

## 7.7 Invites this week

Daily invite counts for the current week against the daily target.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `days` | array of `{ label, sent }` | Yes | One entry per working day of the current week to date. |
| `dailyTarget` | integer | Yes | Rendered as a reference line, labelled with its value. |
| `todayIndex` | integer | Yes | The current day is highlighted and labelled "today". |

Rules:

- The chart covers the agency's working days only; non-working days are omitted,
  not shown as zero.
- Future days in the current week are not plotted.

## 7.8 My funnel

Window: last 30 days. Scope: this employee's own activity.

| Step | Machine value | Counted |
|---|---|---|
| Invites sent | `invites_sent` | Invites logged by this employee in the window. |
| Connected | `connected` | Of those, how many accepted. |
| JD shared | `jd_shared` | Of those, how many were sent the job description. |
| CVs received | `cvs_received` | Of those, how many returned a CV. |

Rules:

| # | Rule |
|---|---|
| 7.8.1 | Every percentage is against **invites sent**. Same top-of-funnel convention as §6.7, and the same open question in §5.6 applies. |
| 7.8.2 | Cohort rule as 6.7.3: a prospect is attributed to the window in which the invite was sent. |
| 7.8.3 | The benchmark line compares the employee's invite→CV rate with the **team average** for the same window. The team average is an aggregate only: no other individual's figures are exposed on this screen (3.3.4). |
| 7.8.4 | The benchmark is suppressed when the team has fewer than a minimum number of contributing members in the window, to avoid the "average" identifying one colleague. PROPOSED - needs product sign-off: minimum of three contributors. |

---

# 8. Cross-cutting widget rules

## 8.1 Widget states

| Machine value | Display label | When |
|---|---|---|
| `loading` | — | Aggregate not yet resolved. |
| `ready` | — | Data present. |
| `empty` | — | Query succeeded, no rows. |
| `denied` | — | User lacks the permission the widget needs. |
| `error` | — | Aggregate failed or is internally inconsistent. |

Rules:

| # | Rule |
|---|---|
| 8.1.1 | `loading` renders a placeholder of the widget's own shape. It never renders `0`, `—` or an empty chart — a stale zero reads as fact. |
| 8.1.2 | `denied` **omits the widget entirely**. It does not render a locked or blurred placeholder, which would disclose that the data exists. |
| 8.1.3 | `error` renders the widget frame with a plain message and a retry, and does not take down the rest of the dashboard. Widgets fail independently. |
| 8.1.4 | `empty` is widget-specific copy that says what would make data appear (§9). |

## 8.2 Drill-through

| # | Rule |
|---|---|
| 8.2.1 | Every number on every dashboard is either a link to the records behind it, or explicitly labelled as derived (a rate, an average, a benchmark). |
| 8.2.2 | The destination list must reproduce the same predicate — same scope, same window, same filters — so the row count matches the number that was clicked. |
| 8.2.3 | Drill-through never widens scope. |

## 8.3 Refresh and freshness

| # | Rule |
|---|---|
| 8.3.1 | Aggregates are computed on read, not snapshotted, except where a rule says otherwise (§5.4 daily insight). |
| 8.3.2 | The dashboard revalidates on window focus and after any mutation made from one of its queues. |
| 8.3.3 | A queue action updates its widget optimistically and reconciles on the server response; a failed action restores the row and reports the failure. |
| 8.3.4 | Relative times ("in 45 min", "2h ago") recompute on the client without a refetch. |
| 8.3.5 | Day boundaries ("today", "this week") are evaluated in the signed-in user's timezone against the agency's working calendar. A user's dashboard rolls over at their midnight, not the server's. |

## 8.4 Export

| # | Rule |
|---|---|
| 8.4.1 | Where an export action is offered, it exports exactly the visible, in-scope data of the widget it belongs to, with the active period and filters applied. |
| 8.4.2 | A metric hidden by permission (e.g. `revenue`, §5.5.1) is excluded from the export as well as from the screen. |
| 8.4.3 | Export is disabled, not hidden, when there is nothing to export. |

---

# 9. First run and empty states

## 9.1 Empty-state kinds

| Machine value | Display label | Meaning |
|---|---|---|
| `first_run` | — | The agency itself has no data: no clients, no jobs, no candidates. |
| `no_assignments` | — | The agency has data; this user has nothing assigned to them. |
| `all_clear` | — | This user had work in this queue and has finished it. |
| `filtered_empty` | — | Data exists in scope but the active filter or search excludes it. |

These are four different messages. Rendering `first_run` copy to a user who is
merely unassigned is a bug.

## 9.2 First run (`owner_dashboard`)

Condition: the agency has zero clients **and** zero jobs **and** zero candidates.

| Region | First-run behaviour |
|---|---|
| KPI cards | Render with a de-emphasised `0` and a per-card hint: "No roles yet", "Nothing sourced", "Your first is coming". Cards remain links to their (empty) modules. |
| Trend chart | Axis and day labels render; the plot area carries an inline message explaining that sourcing activity will chart there. No bars. |
| Recent candidates | Table header renders; body is replaced by an empty state with two actions: create a role, add a candidate. |
| Next interview | Empty state with a single action: book an interview. |
| Upcoming interviews | Empty state; no action beyond the module link. |
| AI screening | Shows `0 screened of <quota> daily quota` and an explanatory line. The quota is real and is shown because it is a fact about the plan, not about activity. |
| Quick actions | Add requirement, invite a teammate, import candidates. |
| Sidebar | Trial card with days remaining and a link to plans, when the agency is in trial. |
| Priorities / SLA / pipeline health / AI insight | Omitted entirely — a first-run agency has no obligations, and rendering these with zeros is noise. |

Rules:

| # | Rule |
|---|---|
| 9.2.1 | First run is a property of the **agency**, not of the user. Every agency-wide user sees it until the first client, job or candidate exists. |
| 9.2.2 | The state clears as soon as any one of the three record types exists. It does not require all three. |
| 9.2.3 | Every first-run empty state offers at most two actions, and the primary one is the next step in the setup path: create a client, then a role, then source. |
| 9.2.4 | Export and other actions that cannot succeed are rendered disabled, not hidden, so the screen's shape is stable once data arrives. |

> **Open question:** the first-run screen shows a right rail with a "Filter
> interviews…" field over an empty interview list, and an Export control that is
> disabled. PROPOSED - needs product sign-off: hide the filter field when the
> list it filters is in `first_run` (there is nothing to filter), but keep the
> disabled Export per 9.2.4.

## 9.3 No assignments

| Variant | Condition | Behaviour |
|---|---|---|
| `lead_dashboard` | The lead has no clients assigned. | KPI cards render zero. The review queue, client decisions, funnel and by-sourcer widgets render a single message stating that no clients are assigned and naming who can assign them. No CTA the lead cannot perform. |
| `employee_dashboard` | The employee has no roles assigned. | The newly-assigned banner is absent. "My roles" renders a message that no roles are assigned yet and points at the requirement owner. Invite target renders as `0 of 0` and the progress bar is omitted. Funnel and weekly chart render `empty`. |

Rule: a `no_assignments` state must never offer the user an action that requires
a permission they do not hold. If the only remedy is someone else's action, say
whose.

## 9.4 All clear

| Variant | Widget | Behaviour |
|---|---|---|
| `lead_dashboard` | CV review queue | Once every item in the queue has been submitted, the queue is replaced by an "All caught up" state explaining that new CVs from the team will appear there. |
| `owner_dashboard` | Today's priorities | When no priority item is generated, the widget states that there is nothing outstanding rather than rendering an empty list. |
| `employee_dashboard` | Today's follow-ups | As above. |

`all_clear` is only reachable by clearing work. A queue that was empty on arrival
shows `no_assignments` or `first_run`, not `all_clear`.

## 9.5 Filtered empty

When a search or filter excludes every row, the widget says so and offers to
clear the filter. It must not be confused with `empty`.

---

# 10. Notifications and counters

The bell in the app bar is shared across all three variants and is specified in
the notifications module. Only its dashboard-relevant rules are stated here.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `unreadCount` | integer | Yes | Displayed as `99+` above 99. |
| `notificationType` | enum | Yes | `candidate`, `client`, `system`. |
| `unread` | boolean | Yes | Drives emphasis. |

| # | Rule |
|---|---|
| 10.1 | Notifications are scoped exactly as the dashboard is (§3). A lead is never notified about a client outside their set. |
| 10.2 | Marking all read is a per-user action and never mutates the underlying records. |
| 10.3 | A dashboard queue item and a notification about the same event are independent: reading the notification does not clear the queue item, and clearing the queue item does not mark the notification read. |

---

# 11. Permissions

Widget visibility follows permission keys, never role names.

| Widget | Required capability | Behaviour without it |
|---|---|---|
| Dashboard route | `dashboard` read | Access denied |
| KPI cards, pipeline health, SLA status | `dashboard` read | — |
| Recent candidates table | `candidates` read | Widget omitted |
| Submissions KPI, submit actions | `submissions.submit` for the action | Queue renders read-only |
| Client decisions, client-overdue counter | `clients` read | Widget omitted |
| Interviews widgets | `interviews` read | Widget omitted |
| `revenue` trend metric | `commissions` read | Metric tab omitted, and excluded from export |
| By sourcer table, team activity feed | `members.view` | Widget omitted |
| AI recommendations, AI insight, AI activity | AI access | Widget omitted |
| Trial / upgrade card, seat count | `billing.view` | Card omitted |
| Role preview banner | `members.view` | Preview unavailable |

| # | Rule |
|---|---|
| 11.1 | Permission checks are on keys, not on the role string. No dashboard behaviour may branch on `role === "…"` other than the variant selection in §2.3. |
| 11.2 | Every check is enforced server-side on the aggregate endpoint as well as in the UI. A hidden widget must also be an unanswered query. |
| 11.3 | `denied` omits, it does not disable (8.1.2). |

---

# 12. Open questions summary

The judgement calls and unresolved points raised above, collected for sign-off:

| § | Question |
|---|---|
| Preamble | Module 00 and Module 01 do not exist yet; every enum below must be reconciled against Module 00 once written. |
| 1.3 | Do `owner` and `admin` share one dashboard variant? |
| 2.7 | Is role preview offered for the `client` role? |
| 3.3 | Is the lead's review queue `client_set` only, or `client_set` ∪ individually assigned roles? |
| 4.1 | Is there a terminal "Hired"/"Joined" stage, or is it `status = "placed"`? Do the funnels start at `sourced` or `screening`? |
| 4.3 | Which SLA obligations does the SLA widget count? |
| 4.5 | Is the `weekly` chart a trailing 12 days with a current-week headline? |
| 4.7 | Is lakh/crore abbreviation currency-driven, locale-driven, or an agency setting? |
| 5.3 | Is the third Owner KPI card "Submissions" or "Hires this month"? |
| 5.6 | Step-to-step or top-of-funnel conversion — one convention for all three funnels. |
| 5.6 | Are `stallDays` and `stallThreshold` agency-configurable? |
| 5.9 | What is "Shortlisted"? |
| 6.4.6 | Does the bulk-submit threshold come from the agency AI threshold? Is bulk submit confirmed before it fires? |
| 7.3 | Is the daily invite target per user, per role, or per agency, and who edits it? |
| 7.4.1 | Is the "next step" precedence ladder correct, and what is the follow-up threshold? |
| 7.8.4 | What is the minimum contributor count before a team benchmark is shown? |
| 9.2 | Hide the interview filter field in `first_run`? |
| — | The module numbers cross-referenced here (Module 00, Module 01, Module 19) need confirming against Module 01's module map, as do the numbers for the Analytics, AI Screening, Interviews, Notifications and Client Portal chapters referenced by name. |

---

Next: Module 27 - Analytics and Reporting

> **Open question:** the chapter following this one is assumed to be Analytics
> and Reporting. Confirm against Module 01's module map.
