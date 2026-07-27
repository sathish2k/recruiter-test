# Module 38 - Search, Filters, Sorting & List Conventions

> **Open question — missing source of truth.** `doc/00-Glossary-and-Conventions.md` and
> `doc/01-Introduction-System-Overview.md` do not exist in the repository at the time of writing, so
> the authoritative pipeline stages, status enums, SLA catalogue, ID formats, currency and fiscal
> calendar could not be read. This chapter therefore **defers** every entity enum to Module 00 §3 and
> quotes only the display labels observed in the design files, marked as unverified. No stage,
> status or SLA value in this chapter may be treated as authoritative; each must be reconciled
> against Module 00 before build. Machine values introduced *by this module* (search scopes, sort
> directions, URL parameters) are marked PROPOSED and are within this module's own remit.

---

# 1. Overview

## 1.1 Purpose

Every list, card grid and board in HirePilotX is a different projection of the same interaction
grammar: scoped search, filter groups, sorting, pagination, selection and bulk action. This module
defines that grammar once. Individual module chapters describe *which* fields a surface exposes;
they do not redefine *how* search, filtering, sorting or selection behave.

Where an individual surface departs from this grammar, that departure must be stated explicitly in
that surface's own chapter and justified. Silence means "obeys Module 38".

## 1.2 Surfaces in scope

| Surface | Presentation | Reference design |
|---|---|---|
| Candidates | Table, with a Board alternate | `AIRecruiter - Candidates.dc.html` |
| Requirements (Jobs) | Table, paginated | `AIRecruiter - Jobs.dc.html` |
| Clients | Card grid, paginated | `AIRecruiter - Clients.dc.html` |
| Contacts, Interviews, Placements, Commissions, Team Activity, Audit Log | Table | Their own chapters |
| Candidate pipeline board | Kanban | Board rules in §4.9 and §7.6 |

> **Naming.** The navigation item reads **Jobs** but the screen title, page counts and all copy on
> that surface read **Requirements** (`data-screen-label="Requirements"`, "of 438 candidates" vs
> "requirements match", "Add Requirement" in the command palette, "+ Add Job" on the button).
> **Open question:** is the user-facing noun *Job* or *Requirement*? One must be chosen and applied
> to navigation, page titles, counts, buttons, toasts and the command palette consistently. This
> chapter uses **requirement** for the entity and notes where the design says otherwise.

## 1.3 Out of scope

Field-level validation (each entity's own chapter), report and analytics filtering, client portal
list behaviour (the portal is an external, permission-restricted surface with its own reduced
grammar), and any presentation concern — spacing, colour, iconography, component naming.

## 1.4 The list contract

Every in-scope surface must provide, in this order of precedence:

1. A **result set** derived deterministically from: scope-qualified search text, applied filter
   groups, and the viewer's permission scope.
2. A **result count** that always reflects the filtered total, never the page size.
3. A **stable order** — an explicit sort when one is active, otherwise the surface's documented
   default order.
4. An **empty result state** distinguishable from an **empty entity state** (§11).

Rule: filters and search **intersect** (logical AND across groups). Values *within* one filter group
**union** (logical OR). No surface offers an OR-across-groups or NOT operator in this release.

---

# 2. Scoped search

## 2.1 Behaviour

A single free-text field per surface, paired with a **scope selector** that narrows which fields the
text is matched against. Search is:

- Case-insensitive.
- Substring ("contains"), not prefix and not fuzzy.
- Trimmed of leading and trailing whitespace before matching; a field containing only whitespace is
  treated as empty and imposes no constraint.
- Applied **before** filter groups conceptually, though the result is identical either way, as both
  are conjunctive.
- Re-evaluated as the user types. PROPOSED - needs product sign-off: debounce server-backed search
  at 250 ms and never issue a request for a query shorter than 2 characters unless the field is
  cleared.

Changing the scope while text is present re-evaluates the result set immediately against the new
scope; the text is retained.

## 2.2 Scope catalogue

Scope machine values are PROPOSED - needs product sign-off.

### Candidates

| Machine value | Display label | Fields matched |
|---|---|---|
| `all` | All | Candidate name, role title, client name |
| `name` | Name | Candidate name |
| `role` | Role | Role title |
| `client` | Client | Client name |

Placeholder text: `all` → "Search by name, email or role…"; any other scope → "Search by
&lt;scope&gt;…".

> **Open question:** the `all` placeholder promises **email**, but the design's match predicate for
> `all` covers name, role and client only — email is never searched, and client is never advertised.
> Either the predicate must gain email or the placeholder must drop it. PROPOSED - needs product
> sign-off: `all` matches candidate name, email, role title and client name, and the placeholder
> reads "Search by name, email, role or client…".

### Requirements

| Machine value | Display label | Fields matched |
|---|---|---|
| `all` | All | Requirement title, client name, owner name, hiring manager name, requirement ID, skills, location |
| `role` | Role | Requirement title |
| `client` | Client | Client name |
| `owner` | Owner | Owner name **and** hiring manager name |
| `job_id` | Job ID | Requirement ID |

Placeholder: `all` → "Search jobs, clients or ID…"; otherwise "Search by &lt;scope&gt;…".

Rules:

- The `owner` scope deliberately spans two distinct people — the internal owner and the client-side
  hiring manager. This is a documented widening, not a defect; the display label must therefore read
  **Owner** but the tooltip/help text must say "owner or hiring manager".
- The `all` scope matches **skills** and **location** even though no scope exposes them directly.
  Skills matching is substring against the concatenated skill list, so a two-word query such as
  "design systems" matches only if the skills are stored in that adjacency. PROPOSED - needs product
  sign-off: tokenise the query on whitespace and require every token to match some skill.
- Requirement IDs are rendered `REQ-2041` in the design. The canonical ID format is defined in
  Module 00; this chapter does not fix it. Search on `job_id` must match with or without the prefix
  and be case-insensitive, so `2041`, `req-2041` and `REQ-2041` all resolve.

### Clients

The Clients surface presents a search field with the placeholder "Search client, contact,
requirement or recruiter…" and no scope selector.

> **Open question:** in the reference design this field is inert — it has no change handler and does
> not affect the card grid, which is filtered only by the status tab and the Health selector. Either
> the field is specified and wired, or it is removed. PROPOSED - needs product sign-off: the Clients
> field is a single unscoped search matching client name, industry, account manager name, linked
> contact name and the titles of that client's open requirements.

## 2.3 The ⌘K affordance

The Clients search field carries a `⌘K` hint badge. This is misleading: `⌘K` opens the global
command palette (§13), not the surface's own search field.

Rule: a surface-local search field must **not** advertise `⌘K`. If a shortcut badge is shown on a
list search field it must be the focus-search shortcut. PROPOSED - needs product sign-off: `/`
focuses the current surface's search field, and the badge reads `/`.

---

# 3. Filter groups

## 3.1 Anatomy

Filters are organised into **groups**. A group has a machine key, a display label, a selection
cardinality, and an option set. Groups are surfaced in one of three places:

| Placement | Behaviour | Applies |
|---|---|---|
| **Inline chip** | A pill in the filter row; opens a dropdown of options | Immediately on toggle |
| **Advanced popover** | Inside the "Filters" popover | Only on Apply (§4) |
| **Overflowed** | An inline group with no horizontal room, relocated into the Filters popover | Immediately on toggle |

Overflow is measured, not fixed (§3.5). A group's placement therefore changes with viewport width
while its semantics do not.

## 3.2 Group catalogue — Candidates

Option display labels below are transcribed from the design and are **unverified against Module
00**. Machine values must be taken from Module 00 §3 (stages) and the source/enum tables in the
relevant entity chapters.

**Inline groups** (multi-select, apply immediately):

| Key | Label | Options (display) | Notes |
|---|---|---|---|
| `stage` | Stage | Sourced · Screened · Shortlisted · Interviewing · Offer · Rejected | **Must** be replaced by the Module 00 §3 pipeline stage enum — see §3.6 |
| `client` | Client | The workspace's client list | Options are data, not a fixed enum |
| `role` | Role | Engineering · Design · Data · Product | Role *category*, not the role title shown in the row |

Rule: the `role` filter matches the candidate's role **category**, while the `role` search scope
matches the role **title**. Two different fields share one word. PROPOSED - needs product sign-off:
rename the filter to **Function** or the column to **Role title** so the distinction is legible.

**Advanced group** (inside the Filters popover, draft-then-apply):

| Key | Label | Type | Default | Rules |
|---|---|---|---|---|
| `source` | Source | Multi-select | none selected | LinkedIn · Referral · Indeed · Careers page. Empty = no constraint |
| `match` | AI match | Threshold slider | `50` | Values ≤ 50 display as "Any" and impose no constraint; above 50 the predicate is `match ≥ value`, displayed "≥ N%" |
| `applied` | Applied | Single-select band | `Any time` | Any time · Last 7 days · Last 30 days · Last 90 days. Evaluated as whole days elapsed since the applied date |
| `expMin` / `expMax` | Experience (years) | Numeric range | empty / empty | Integers, max 2 digits, non-numeric input rejected on entry. Either bound may be omitted. Inclusive on both ends |
| `resume` | Resume | Single-select | `Any` | Any · With resume · No resume |

## 3.3 Group catalogue — Requirements

**Inline groups** (multi-select, apply immediately):

| Key | Label | Options (display) | Notes |
|---|---|---|---|
| `role` | Role | Engineering · Design · Data · Product | Role category |
| `client` | Client | Workspace client list | Data-driven |
| `owner` | Owner | Workspace users with requirements assigned | Data-driven; internal owner only, **not** the hiring manager |
| `status` | Status | Active · Draft · Closed | Requirement lifecycle status — reconcile against Module 00 |

**Advanced group:**

| Key | Label | Type | Default | Rules |
|---|---|---|---|---|
| `location` | Location | Multi-select | none | Data-driven from posted locations |
| `empType` | Employment type | Multi-select | none | Full-time · Contract · Part-time |
| `level` | Experience level | Multi-select | none | Junior · Mid · Senior · Staff |
| `coverage` | AI coverage | Multi-select | none | Excellent · Good · Needs sourcing — a **derived band**, see below |
| `attention` | Attention | Single-select | `Any` | Any · Needs attention · All clear |
| `matched` | AI matches | Threshold slider | `0` | `0` displays "Any" and imposes no constraint; above 0 the predicate is `matched ≥ value`, displayed "≥ N" |
| `posted` | Posted | Single-select band | `Any time` | Any time · Last 7 days · Last 30 days · Last 90 days |
| `pipeMin` / `pipeMax` | Pipeline size | Numeric range | empty / empty | Integers, max 4 digits, inclusive bounds |

Derived-value rules:

- **AI coverage band** is computed from the requirement's AI match count, not stored:
  `matched ≥ 30` → Excellent; `matched ≥ 15` → Good; otherwise → Needs sourcing.
  PROPOSED - needs product sign-off: these thresholds are absolute counts, so a requirement with two
  openings and 29 matches bands identically to one with twenty openings and 29 matches. Coverage
  should be expressed relative to openings or to a target shortlist size.
- **Attention** is a boolean projection of whether the requirement currently carries an attention
  flag (an SLA or activity warning). `Needs attention` selects flagged requirements; `All clear`
  selects unflagged ones. The catalogue of attention conditions and their SLA thresholds is owned by
  Module 00's SLA catalogue and must not be duplicated here.
- A requirement whose status is not Active carries no attention flag; changing status to Draft or
  Closed clears it.

## 3.4 Group catalogue — Clients

Clients use a reduced grammar: no chip row, no advanced popover.

| Control | Type | Options | Behaviour |
|---|---|---|---|
| Status tabs | Single-select, exclusive | All · Hiring · Paused | Each tab shows a live count of matching clients |
| Health | Single-select dropdown | All · Healthy · Attention · At risk · Dormant | Each option shows a count computed against **all** clients, not against the active tab |

Rules:

- The two controls intersect: the tab narrows first, then Health narrows the tab's result.
- Health option counts are computed pre-tab, so an option may show a non-zero count and still yield
  zero cards under the active tab. PROPOSED - needs product sign-off: counts should be computed
  against the tab-filtered set so a non-zero count never produces an empty grid.
- The Health control adopts the active-filter treatment when a value other than `All` is selected,
  its label becomes "Health · &lt;value&gt;", and its trailing affordance becomes a clear control
  that resets it to `All` without opening the dropdown.

> **Open question:** Clients has neither a Filters popover, saved views, sorting, bulk selection nor
> column control. Is this a deliberate simplification for a low-cardinality entity, or an
> unfinished surface? If deliberate, the Clients chapter must say so.

## 3.5 Chip overflow

Inline chips occupy a single row that never wraps. The number that fit is measured against the
available width and recomputed on resize.

Rules:

- Groups are considered in their declared order; the first *n* that fit are rendered inline, the
  remainder move into the Filters popover under their group label as a chip cloud.
- Overflow changes placement only. An overflowed group still applies immediately on toggle and is
  **not** governed by draft-then-apply (§4.3).
- An overflowed group that carries a selection contributes to the Filters count badge (§5).
- Default fit before measurement completes: 3 groups on Candidates, 4 on Requirements. This is a
  first-paint fallback, not a maximum.

## 3.6 Stage and status filters must not fork

The design files disagree with themselves about candidate stages. The chip group offers
*Sourced · Screened · Shortlisted · Interviewing · Offer · Rejected*, the row-level stage editor
offers the same six, and the command palette describes candidates as being at *Submitted*,
*Lead review*, *CV received*, *Offer accepted*, *Interview* and *Sourcing*. The Clients card
pipeline bar uses a third set: *Sourced*, *Screening*, *Interviewing*.

Rule: there is exactly one candidate stage enum, defined in **Module 00 §3**. Every filter group,
every board column, every row-level editor and every derived summary bar reads that one enum. A
surface may *group* stages for display (a three-segment flow bar is a legitimate grouping) but the
grouping must be declared in that surface's chapter and expressed in terms of the Module 00 machine
values.

> **Open question:** which of the three observed vocabularies is correct, and are *Submitted* and
> *Lead review* stages in their own right (which would make them filterable and boardable) or
> sub-states of *Screened*? This directly affects Module 19 submissions, which needs a stage that
> means "sent to the client".

---

# 4. Draft-then-apply

## 4.1 The two application modes

| Mode | Used by | Effect of a change |
|---|---|---|
| **Immediate** | Inline chip groups, overflowed chip groups, Clients tabs and Health, saved-view chips, filter entry points (§6) | Result set updates on the toggle |
| **Draft** | Every group inside the Filters popover's *advanced* section | Result set unchanged until Apply |

## 4.2 Lifecycle

1. **Open.** Opening the Filters popover copies the currently applied advanced criteria into a
   draft. Any previously abandoned draft is discarded at this moment.
2. **Edit.** Every control inside the advanced section mutates the draft only.
3. **Preview.** While the draft carries at least one active criterion, the popover shows a live
   count — "N of M candidates match" / "N of M requirements match" — computed as: current search +
   current inline groups + **draft** advanced criteria. Inline groups are therefore held constant
   during preview.
4. **Apply.** The draft is promoted to applied, the popover closes, and (on Requirements) pagination
   resets to page 1.
5. **Cancel / dismiss.** The draft is discarded and reset from the applied state. Closing by
   clicking outside the popover, pressing Escape, or pressing Cancel are all equivalent — none
   applies the draft.

Rule: the popover's primary button is labelled **Apply** when the draft carries no active criterion
and **Show N** when it does, where N is the previewed count. A preview of zero still renders as
"Show 0" and remains enabled — applying an empty result is a legitimate outcome that produces the
no-results state (§11.2).

> **Open question:** on Candidates, Apply does not reset pagination while on Requirements it does.
> Applying a filter while on page 4 must never leave the user on a page that no longer exists.
> PROPOSED - needs product sign-off: **any** change to search, scope, or any filter group resets the
> surface to page 1, on every surface.

## 4.3 Immediate groups are not drafted

An inline or overflowed chip group applies on toggle even when it is rendered *inside* the Filters
popover because of overflow. The popover therefore contains both immediate and drafted controls at
narrow widths.

> **Open question:** this is a genuine inconsistency — two controls sitting in the same popover
> behave differently, and Cancel reverts one but not the other. PROPOSED - needs product sign-off:
> once a group is inside the popover it is drafted, and Cancel reverts it too. The cost is that
> chip-row overflow silently changes a group's apply semantics, which argues instead for making
> **all** popover groups immediate and dropping the Apply button. A decision is required before
> build; the two halves must not ship as they are.

---

# 5. Count badges and active-filter signalling

## 5.1 Chip labels

An inline chip's label is:

| Selection count | Label |
|---|---|
| 0 | The group label alone, e.g. "Stage" |
| 1 | "Stage: Interviewing" |
| n > 1 | "Stage: Interviewing +2" — the first selected value plus the count of the remainder |

Rule: "first selected value" means the first value in the **group's declared option order**, not
click order, so the label is stable across sessions and shareable views.

## 5.2 The chip's trailing affordance

| State | Affordance | Action |
|---|---|---|
| No selection | Expand indicator | Opens the group dropdown |
| Has selection | Clear indicator | Clears **that group only**, without opening the dropdown |

The clear action must not propagate to the chip's own open/close handler.

## 5.3 The Filters count badge

The Filters control shows a numeric badge equal to:

```
badge = (number of active advanced criteria)
      + (number of overflowed inline groups that carry a selection)
```

An "active advanced criterion" counts **one per group**, not one per selected value:

- A multi-select group counts 1 if any value is selected.
- A threshold slider counts 1 only when above its no-constraint value (`match > 50` on Candidates,
  `matched > 0` on Requirements).
- A date band counts 1 when it is not "Any time".
- A numeric range counts 1 when **either** bound is set — a min and a max together still count 1.
- A single-select counts 1 when it is not its default ("Any" / "Any time").

Rule: inline groups that are *not* overflowed are never counted in the badge — their state is
already visible on their own chip. The badge answers "how much filtering is hidden from me".

The Filters control adopts the active treatment when the badge is non-zero **or** while the popover
is open.

## 5.4 Where a filter is visible

Every applied constraint must be visible somewhere without opening a menu: on its own chip, in the
Filters badge, or in the toolbar-level clear control. A filter that is applied but invisible is a
defect.

---

# 6. Clearing filters

Three distinct clear actions exist. They must not be conflated.

| Control | Location | Scope |
|---|---|---|
| Chip clear | On each inline chip carrying a selection | That one group |
| "Clear all" (popover) | Footer of the Filters popover | All **advanced** criteria — both draft and applied — leaving inline groups and search untouched |
| "Clear all" (toolbar) | Filter row, shown only while any filter is active | Search text, **all** inline groups, all advanced criteria; closes every open popover |

Rules:

- The toolbar "Clear all" is hidden entirely when nothing is filtered. Its visibility is the
  canonical answer to "is this list filtered?".
- The toolbar "Clear all" does **not** reset: sort, column visibility, page size, or the Table/Board
  view preference. It resets *what is shown*, not *how it is shown*.
- It **does** reset the page to 1.
- Clearing never clears the current selection (§9). PROPOSED - needs product sign-off: rows that
  leave the result set stay selected and continue to count toward the bulk bar, so a bulk action can
  still act on a row the user can no longer see. Either selection is scoped to the visible result
  set and pruned on every filter change, or the bulk bar must state "N selected (M not shown)". The
  first is safer.

## 6.1 Filter entry points

Other surfaces may deep-link into a pre-filtered list. These set filters immediately and reset
pagination:

| Entry point | Sets |
|---|---|
| Requirements KPI "Active" | `status = [Active]` |
| Requirements KPI "Draft" | `status = [Draft]` |
| Requirements AI banner, "quiet for 5+ days" | `attention = Needs attention` |
| Requirements AI banner, "low AI coverage" | `coverage = [Needs sourcing]` |
| Requirement row owner avatar | `owner = [that owner]`, **replacing** any existing owner selection |

Rule: an entry point that sets an advanced criterion must write it to **both** the applied state and
the draft, so opening the Filters popover afterwards shows the criterion that is actually in force.

Rule: an entry point **replaces** the target group's selection rather than adding to it, and leaves
all other groups untouched. This must be stated in the affordance's tooltip ("Filter to this owner",
not "Add this owner").

---

# 7. Sorting

## 7.1 Tri-state column sort

Clicking a sortable column header cycles:

```
unsorted → ascending → descending → unsorted
```

| State | Machine value | Indicator |
|---|---|---|
| Unsorted | `sortKey = null` | Neutral bidirectional indicator, low emphasis |
| Ascending | `sortDir = "asc"` | Upward indicator, active emphasis |
| Descending | `sortDir = "desc"` | Downward indicator, active emphasis |

Rules:

- **One sort key at a time.** Clicking a different column starts that column at ascending; the
  previous column returns to unsorted. Multi-column sort is not supported in this release.
- Returning to `unsorted` restores the surface's documented default order — it does not leave the
  rows in their last sorted arrangement.
- A hidden column (§8) cannot be sorted. Hiding the column that is currently sorted returns the
  surface to unsorted. PROPOSED - needs product sign-off.

## 7.2 Sort chips

A compact alternative to header sorting, offering a short list of the highest-value keys. Sort chips
and column headers drive the same single sort state — activating one updates the other.

| Surface | Chips |
|---|---|
| Candidates | AI match · Applied · Name |
| Requirements | Pipeline · AI match · Posted |

Rules:

- A chip's first activation sorts **descending** (the useful direction for a score, a count or a
  date), unlike a header's first click which sorts ascending.
- Subsequent activations toggle descending ⇄ ascending. **A chip never returns to unsorted.**
- An active chip appends a direction indicator to its label and adopts the active treatment.

> **Open question:** the two controls disagree on both initial direction and on whether unsorted is
> reachable. PROPOSED - needs product sign-off: adopt the chip semantics everywhere — first
> activation of a numeric or date column sorts descending, first activation of a text column sorts
> ascending, and the third state (unsorted) is reachable from both controls.

## 7.3 Sort value rules

| Column type | Sorted by |
|---|---|
| Text | Case-insensitive comparison of the displayed string |
| Number | Numeric value |
| Date | The underlying timestamp, **never** the formatted display string |
| Enum (stage, status) | The Module 00 §3 declared ordinal, **not** alphabetical |
| Money | Minor units in the record's own currency; see §7.4 |

Rule: dates must sort by timestamp. A column rendering "Jun 14" and "Jul 1" must order by the real
dates, not lexically.

Rule: enum columns must sort by pipeline/lifecycle order, so sorting by Stage produces a pipeline
progression, not `Interviewing, Offer, Rejected, Screened, Shortlisted, Sourced`.

> **Open question:** the Requirements design sorts the Status column by the *attention* label when a
> requirement is flagged and by the *status* label otherwise, mixing two vocabularies in one
> ordering and producing an order no user can predict. PROPOSED - needs product sign-off: Status
> sorts by the Module 00 lifecycle ordinal; attention becomes its own sortable column, ordered
> most-urgent-first.

## 7.4 Money and currency

Any list sorting or filtering a monetary column must compare within a single currency, using the
currency and rounding rules in Module 00. A list mixing currencies must either constrain itself to
one currency via a filter, or sort on a converted value computed at a stated rate and date, with the
conversion basis shown in the column header. Placement fees and invoices are governed by Module 24;
commission values by Module 25.

## 7.5 Default order

Each surface declares its own default order in its own chapter. Where a chapter is silent:
PROPOSED - needs product sign-off: most-recently-updated first, tie-broken by record ID descending,
so the order is total and stable across pages.

## 7.6 Boards

A board (the candidate pipeline) sorts **within** a column, not across the board. The column set is
the stage enum and is not user-reorderable. Search and filters apply to a board identically to a
table; column headers show the filtered count per stage.

---

# 8. Column visibility

Table surfaces offer a column control listing the optional columns with checkboxes.

| Surface | Always shown | Optional |
|---|---|---|
| Candidates | Candidate, Role, Client | AI Match · Experience · Applied on · Stage |
| Requirements | Role, Client | Owner · Pipeline · Submitted · Interviews · AI matches · Status |

Rules:

- Identity columns (the entity's name and its parent client) cannot be hidden — a row must always be
  identifiable.
- The selection checkbox column and the row-actions column are not columns for this purpose and are
  never listed.
- Hiding a column does not remove its filter. Filtering by Stage with the Stage column hidden is
  legal, and the constraint remains visible on its chip.
- Column visibility is a per-user, per-surface preference and persists across sessions.
  PROPOSED - needs product sign-off: stored per user per surface, not per saved view, so switching
  saved views does not reshuffle the user's columns. (A saved view that also captured columns would
  be the alternative; it must be one or the other, not both.)

---

# 9. Pagination and counts

## 9.1 Page sizes

| Surface | Page size | Control |
|---|---|---|
| Requirements | 5 rows | Numbered pages with previous/next |
| Clients | 6 cards | Numbered pages with previous/next |
| Candidates | Not paginated in the design | Range label with an inert single-page control |

> **Open question:** a page size of 5 for Requirements and 6 for Clients is implausible for a
> workspace with 33 active requirements and 438 candidates, and the Candidates surface renders a
> pagination control that does nothing while claiming "1–N of 438 candidates". PROPOSED - needs
> product sign-off: a uniform default page size of 25 for tables and 12 for card grids, with a page
> size selector offering 25/50/100, persisted per user per surface.

## 9.2 Count and range labels

| Surface | Label form |
|---|---|
| Candidates | "1–N of T candidates"; "0 of T candidates" when empty |
| Requirements | "N of T requirements · page P of Q" |
| Clients | "A–B of T clients"; "0 of T clients" when empty |

Rules:

- These forms are inconsistent and must be unified. PROPOSED - needs product sign-off: every
  paginated surface reads "**A–B of T &lt;entities&gt;**", and where more than one page exists it
  appends " · page P of Q". The empty form is "0 of 0 &lt;entities&gt;".
- **T is the filtered total**, not the workspace total. The Candidates design shows "1–10 of 438
  candidates" while ten filtered rows are displayed and 438 is the unfiltered workspace count —
  this is wrong and must not be reproduced. When any filter is active the label must read the
  filtered total, with the unfiltered total available as secondary context only, e.g.
  "1–10 of 32 candidates (438 total)".
- Entity nouns are pluralised by count: "1 candidate", "2 candidates".

## 9.3 Page state rules

- The current page is clamped to the available page count. If filtering reduces the result set below
  the current page, the surface shows the last available page rather than an empty page.
- Any change to search text, search scope, or any filter group resets the page to 1 (§4.2).
- Changing sort does **not** reset the page. PROPOSED - needs product sign-off: it should, because
  page 3 of a re-sorted list shows unrelated records.
- Previous/next are disabled, not hidden, at the ends of the range.

---

# 10. Bulk selection

## 10.1 Row selection

- A checkbox per row toggles that row's selection.
- The selection control must not trigger row navigation; activating it never opens the record.
- Selected rows carry a persistent visual selected state.

## 10.2 The header checkbox

Tri-state:

| State | Meaning |
|---|---|
| Unchecked | Nothing selected in scope |
| Indeterminate | Some but not all rows in scope are selected |
| Checked | Every row in scope is selected |

The definition of **scope** differs between surfaces in the reference design and must be settled:

| Surface | Select-all scope | Deselect-all effect |
|---|---|---|
| Candidates | Every row in the **filtered result set** | Clears the entire selection |
| Requirements | Rows on the **current page** only | Clears only that page's rows, preserving selections on other pages |

> **Open question:** PROPOSED - needs product sign-off: the header checkbox selects the **current
> page** only, on every surface. Where the filtered total exceeds the page, an inline prompt appears
> beneath the header — "All 25 on this page selected. **Select all 312 matching**" — making
> cross-page selection explicit and never implicit. Silent selection of records the user has not
> seen is the failure mode to avoid, given that bulk actions here send email and change pipeline
> stage.

## 10.3 The bulk action bar

Appears while at least one row is selected. Shows "N selected", the surface's bulk actions, and a
clear-selection control.

Rules:

- The bar must state the count, not merely "items selected".
- Every bulk action **clears the selection on completion**, so a destructive or notifying action
  cannot be fired twice by a second click.
- The toolbar Export control retitles itself "Export selected (N)" while a selection exists, and
  exports the selection rather than the result set. With no selection it exports the full filtered
  result set. This retitling is required — an Export control that silently changes its subject is a
  data-leak risk.
- Bulk actions respect permissions per record (§12). Where the selection includes records the viewer
  may not act on, the action must apply to the permitted subset and report the split: "12 updated,
  3 skipped — you do not own them."

## 10.4 Bulk actions per surface

**Candidates**

| Action | Effect | Notes |
|---|---|---|
| Move stage | Sets the pipeline stage of every selected candidate | The target stage must be chosen before anything is written. The reference design defers this to the board, which is a hand-off, not a specification — see open question below |
| Email | Opens a composer pre-populated with the selected candidates as recipients | Sending is a separate, explicit step |
| Assign | Assigns a recruiter to the selected candidates | The design assigns by round robin without asking; PROPOSED - needs product sign-off: the recruiter is chosen explicitly, with round robin offered as an option |
| Export | Exports the selected candidates | §11.4 |

> **Open question:** "Move stage" in the reference design queues the selection, fires a toast and
> navigates to the board, where the user picks the target — a two-screen action with no confirmation
> and no way back. PROPOSED - needs product sign-off: the bulk bar opens a stage picker in place,
> exactly as Requirements' "Change status" does, and writes on confirmation. Stage changes that
> cross into or out of a submitted state must additionally respect Module 19's submission rules.

**Requirements**

| Action | Effect | Notes |
|---|---|---|
| Change status | Sets Active / Draft / Closed on the selection | Opens an in-place picker; the option list is the status enum |
| Assign | Assigns an owner to the selection | Same explicit-choice rule as above |
| Share | Publishes the selected requirements to the relevant client portals | **Externally visible.** Requires explicit confirmation naming the client(s) and the count before publishing |
| Export | Exports the selection | §11.4 |
| Archive | Hides the selection from active lists, reversibly | Presented as a cautionary, not destructive, action |

Rules:

- Closing a requirement stops it accepting applicants. This is a state change with downstream
  effects on the pipeline, submissions (Module 19) and any SLA clocks in Module 00's catalogue; it
  must be confirmed when applied in bulk.
- Archive is reversible and must say so at the point of action.

**Clients**

No bulk selection. Per-card actions only: open, add requirement, view contacts, edit, delete.

> **Open question:** Delete on a client card in the reference design removes the client immediately
> with only a toast — no confirmation, and no statement of what happens to that client's
> requirements, contacts, submissions, placements and invoices. Deletion of an entity with financial
> descendants (Module 24 placements and invoices, Module 25 commissions) cannot be a one-click
> action. PROPOSED - needs product sign-off: a client with any requirement, placement or invoice
> cannot be deleted, only archived; deletion is available only for clients with no descendants and
> requires typed confirmation of the client name.

---

# 11. States, empties and exports

## 11.1 Loading

A list in flight shows a placeholder preserving the row/card structure and count, so the toolbar
does not reflow when data arrives. Toolbar controls remain interactive during loading; filter
changes issued while loading supersede the in-flight request.

## 11.2 No results (filtered)

Shown when the entity has records but the current search and filters match none.

Required content:

- A statement of what matched nothing: "No candidates match these filters".
- A recovery instruction naming both levers: "Try removing a filter or broadening your search".
- A one-action escape hatch that performs the toolbar "Clear all".

Rule: the no-results state never offers a create action. Creating a record is not a response to an
over-narrow filter.

## 11.3 Empty (no records at all)

Distinct from §11.2 and specified per surface in that surface's first-run chapter. It **does** offer
a create action, and it hides the filter row entirely — filtering nothing is noise.

## 11.4 Export

Available from every list toolbar. Formats: PDF (`.pdf`), Excel (`.xlsx`), Word (`.docx`).

Rules:

- The export subject is the **current filtered result set** across all pages, or the current
  selection when one exists (§10.3) — never the current page alone.
- The export respects column visibility. PROPOSED - needs product sign-off: hidden columns are
  excluded, so the export matches what the user is looking at.
- Export is asynchronous and acknowledged by a toast; it does not block the list.
- Requirements additionally offers a scheduled recurring export ("Weekly report"). Creating a
  recurring delivery is standing configuration and must be confirmed explicitly, stating recipient
  and cadence.

## 11.5 Import

Candidates and Requirements offer CSV import from the list toolbar. The flow is: choose file →
review mapping and duplicates → confirm.

Rules:

- Duplicates are detected before import and reported by count and by name, with the matching key
  stated ("same email as existing candidates").
- Duplicates are **merged, not re-added**, and the confirm button states the net count of new
  records ("Import 211 candidates" for a 214-row file with 3 duplicates).
- The row limit is stated up front on the drop target.
- Import is confirmed by an explicit action; nothing is written on file selection.

---

# 12. Permissions and row scoping

- A list never shows a record the viewer may not read. Filters narrow an already permission-scoped
  set; they never widen it.
- **Counts obey the same scope.** A result count, a Health count, a tab count or a stage count must
  count only records the viewer can read. A count that reveals the existence of invisible records is
  a leak.
- Bulk actions are evaluated per record and report the permitted/skipped split (§10.3).
- Export and scheduled export carry the exporter's scope at the moment the export runs, not the
  scope at the moment it was scheduled.
- Filter option lists are themselves scoped: a user who cannot see a client must not see that client
  in the Client filter's options.
- Actions with external visibility — Share to client portal, Email — require a permission distinct
  from read and edit. The role catalogue is defined in the roles and permissions module; this
  chapter only asserts that list-level bulk actions are gated by the same rules as their per-record
  equivalents, with no bulk-only bypass.

---

# 13. URL persistence and shareable views

Nothing in the reference designs persists list state to the URL; all state is transient, and the
only persisted preference is the Candidates Table/Board choice. The following is therefore
PROPOSED - needs product sign-off in its entirety.

## 13.1 Rule

Every list surface encodes its full display state in the URL query string, so that a filtered list
is addressable, bookmarkable, shareable, and survives reload and back/forward navigation.

## 13.2 Parameters

| Parameter | Type | Meaning |
|---|---|---|
| `q` | string | Search text |
| `scope` | enum | Search scope machine value (§2.2); omitted when `all` |
| `f.<group>` | comma-separated list | Selected values for a multi-select group, e.g. `f.stage=interviewing,offer` |
| `f.<group>` | scalar | Value for a single-select or threshold group, e.g. `f.match=75` |
| `f.<group>.min` / `.max` | number | Bounds of a numeric range group |
| `sort` | string | Sort key; omitted when unsorted |
| `dir` | `asc` \| `desc` | Sort direction; omitted when unsorted |
| `page` | integer | 1-based page; omitted when 1 |
| `size` | integer | Page size; omitted when the surface default |
| `view` | string | Saved view identifier (§14) |

Rules:

- Parameters at their default value are **omitted**, so an unfiltered list has a clean URL.
- Unknown parameters and unknown enum values are ignored, not errored — a URL shared after an enum
  changes must still open the list.
- Filter changes **replace** the history entry; page and sort changes **push** one, so Back returns
  to the previous page rather than unwinding every keystroke.
- Selection and column visibility are **not** encoded. Selection is transient; columns are a
  per-user preference (§8). A shared link must not reshuffle the recipient's columns.
- Personal data is never placed in the query string. Search text is user-entered and may contain a
  name or email; a shared filtered link therefore carries it. PROPOSED - needs product sign-off:
  `q` is included (it is the user's own text about their own workspace) but excluded from analytics
  capture and from any logging of URLs.

---

# 14. Saved views

A saved view captures a named filter state for one-click recall.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `name` | string | Yes | Auto-proposed, user-editable — see below |
| `q` | string | No | Search text at save time |
| `scope` | enum | No | Search scope at save time |
| `filters` | object | No | All inline and advanced group selections |
| `owner` | user reference | Yes | The creating user |
| `shared` | boolean | Yes | PROPOSED: default `false` — private to the creator |

Rules:

- The proposed name is derived from the state: the search text in quotes if present, then the first
  selected value of each active group, joined by a separator and truncated to two parts. With no
  filters the proposal is "All candidates" / "All requirements".
- Saving a view whose name already exists **replaces** it silently in the reference design. This is
  a destructive default. PROPOSED - needs product sign-off: the name is presented for confirmation
  before saving, and a collision prompts "Replace the existing view?".
- Applying a view replaces search text, scope, all inline groups and all advanced criteria, and
  resets the page to 1. It does not change sort or columns.
- Views persist per user. The reference design holds them in component state, so they are lost on
  reload — this is a prototype limitation, not the specification.
- Removing a view is available from the view chip and requires no confirmation, because a view holds
  no data of its own.

> **Open question:** should saved views be shareable across the workspace (a team-wide "Needs
> attention" view), and if so who may create shared views? This interacts with §12 — a shared view
> applied by a user with a narrower scope must silently yield fewer records, not error.

---

# 15. Command palette

Opened from anywhere with `⌘K` (macOS) / `Ctrl+K` (Windows, Linux). The same shortcut closes it.

## 15.1 Behaviour

| Rule | Detail |
|---|---|
| Open state | The input is empty and focused on every open; the previous query is not retained |
| Empty query | Shows **screens only** — the navigable destinations |
| With query | Searches across all result types |
| Matching | Case-insensitive substring against the item's name, its subtitle and its type label, so typing "candidate" surfaces every candidate |
| Result cap | 24 results |
| Grouping | Results are grouped by type under a group heading, in a fixed type order |
| Keyboard | `↑`/`↓` move the selection; `↵` opens the selected item; `Esc` closes |
| Pointer | Hovering an item moves the selection to it; clicking opens it |
| Dismiss | Clicking outside the panel closes it |
| Footer | States the three key bindings |

## 15.2 Result types

| Type | Subtitle content | Opens |
|---|---|---|
| Screen | none | That screen |
| Candidate | Role · Client · Stage | Candidate detail |
| Job | Client · pipeline size, or "draft" | Requirement detail |
| Client | Industry · open role count | Client detail |
| Team | Role | The team member's record |

Rules:

- Result types are permission-scoped exactly as lists are (§12). The palette must never surface a
  record the user cannot open.
- The empty state names the searchable types: "No matches for &lt;query&gt; — try a candidate, job,
  client, or screen name".
- The palette is a **navigator, not a command runner** in this release: every result navigates, none
  performs an action. PROPOSED - needs product sign-off: whether verb entries ("Add candidate",
  "Start AI screening") are introduced, which would make the naming accurate.

> **Open question:** the palette's candidate subtitles use stage names absent from the stage enum
> (§3.6). They must be regenerated from Module 00 §3.

---

# 16. Keyboard shortcuts

## 16.1 Global bindings

| Keys | Action |
|---|---|
| `⌘K` / `Ctrl+K` | Toggle the command palette |
| `?` | Toggle the keyboard shortcuts overlay |
| `Esc` | Close the topmost menu, popover, dialog or overlay |
| `G` then `D` | Go to Dashboard |
| `G` then `L` | Go to Clients |
| `G` then `C` | Go to Candidates |
| `G` then `J` | Go to Jobs / Requirements |
| `G` then `I` | Go to Interviews |
| `G` then `S` | Go to Settings |

## 16.2 Rules

- **All shortcuts are suppressed while the focus is in a text input, textarea or editable region**,
  with the sole exception of `⌘K` and `Esc`, which must work everywhere including inside the
  palette's own input.
- The `G` prefix opens a chord window of **1200 ms**. A second key within the window navigates; any
  other key, or expiry, cancels the chord silently with no feedback. PROPOSED - needs product
  sign-off: show a transient prefix indicator while the window is open, so a half-typed chord is not
  invisible.
- `Esc` closes exactly one layer per press, outermost-last.
- The shortcuts overlay is reachable both by `?` and by an explicit affordance in the interface, so
  the feature is discoverable without knowing the shortcut that reveals it.
- The overlay states its own suppression rule ("Shortcuts are disabled while typing in a field").
- Chord letters follow the destination's name where free (`D`ashboard, `C`andidates, `J`obs,
  `I`nterviews, `S`ettings). Clients takes `L` because `C` is taken. This collision must be
  documented in the overlay, not left for users to discover.

> **Open question:** no list-local shortcuts are defined — no focus-search, no select-all, no
> row navigation. PROPOSED - needs product sign-off: `/` focuses search (§2.3), `⌘A` selects the
> current page when the list has focus, `Esc` clears the selection.

---

# 17. Toasts, undo and confirmation

## 17.1 Toast behaviour

| Property | Value |
|---|---|
| Position | Fixed, top right |
| Content | A title and an optional single-line detail |
| Kinds | `success` (default) · `warning` · `error` |
| Auto-dismiss | **2600 ms**, with a visible countdown |
| Manual dismiss | Clicking the toast dismisses it |
| Stacking | Newest first; at most **3** visible, the oldest dropped beyond that |

Rules:

- A toast is an acknowledgement, never a control the user must reach. Nothing may be lost by
  ignoring it.
- Errors must not rely on a 2600 ms toast alone. PROPOSED - needs product sign-off: `error` toasts
  do not auto-dismiss and must be dismissed explicitly; `warning` extends to 6000 ms.
- The detail line states the consequence, not the mechanism: "3 duplicates merged", "stopped
  accepting applicants", "N recipients added".

> **Open question:** the Clients surface implements its own toast — bottom right, no auto-dismiss,
> explicit close control — while every other surface uses the shared top-right toast. One
> implementation must win. PROPOSED - needs product sign-off: the shared top-right toast, with the
> non-dismissing behaviour adopted for `error`.

## 17.2 Undo

No undo affordance exists in the reference designs. Reversible bulk and row actions are acknowledged
by a toast and cannot be reversed from it. The following is PROPOSED - needs product sign-off.

Rule: any action that is (a) reversible without side effects and (b) fired from a list without a
confirmation step carries an **Undo** action inside its toast.

| Property | Value |
|---|---|
| Undo window | **10 seconds** — the toast persists for the full window rather than 2600 ms |
| Placement | An explicit Undo action within the toast; the toast is not click-to-dismiss while Undo is present |
| On undo | The prior state is restored, the toast is replaced by a brief confirmation, and no notification is sent for the reverted change |
| On expiry | The toast dismisses; the action is final and reversible only by repeating it inversely |

Actions that **carry Undo**: stage change (row and bulk), status change (row and bulk), owner or
recruiter assignment, archive, saved-view deletion.

Actions that **do not carry Undo** and require confirmation *before* execution instead:

| Action | Reason |
|---|---|
| Email / bulk email | The message has left the system |
| Share with client portal | Externally visible to a third party |
| Reject candidate | Notifies the candidate and affects Module 19 submission state |
| Close requirement | Stops applications and affects SLA clocks and downstream placements |
| Delete client | Irreversible and has financial descendants (Modules 24, 25) |
| Import | Writes many records; confirmed at the review step instead |
| Export, scheduled export | Nothing to reverse; scheduling is confirmed at creation |

Rule: an action is either undoable **or** confirmed. Doing both is friction; doing neither is the
current state and is not acceptable for anything that notifies a person or changes a stage.

## 17.3 Notification side effects

A stage change fired from a list may notify the team ("team notified" in the reference toast). Any
such side effect must be stated in the toast detail and must be suppressed when the action is
undone within the window. Whether the notification is sent immediately or deferred until the undo
window expires is a design decision: PROPOSED - needs product sign-off: **defer** outbound
notifications until the undo window closes.

---

# 18. View persistence

- The Candidates surface offers Table and Board presentations of the same result set. The last
  chosen presentation is remembered per user and reopened on return.
- Switching presentation preserves search, filters and selection; it does not preserve sort, which
  has no meaning on a board (§7.6).
- Remembering the presentation must not be implemented as a redirect on load — a user who follows a
  link to the table must land on the table. PROPOSED - needs product sign-off: the remembered
  presentation applies only when the surface is opened without an explicit `view` parameter (§13.2).

---

# 19. Open questions, consolidated

1. Modules 00 and 01 do not exist; every enum, SLA figure and ID format in this chapter is
   unverified (preamble).
2. Is the entity called a *Job* or a *Requirement*? (§1.2)
3. Which candidate stage vocabulary is authoritative — three conflicting sets appear across the
   designs? (§3.6)
4. Are *Submitted* and *Lead review* first-class stages or sub-states, and how does that bind to
   Module 19? (§3.6)
5. Does the Candidates `all` search scope include email, as its placeholder claims? (§2.2)
6. Is the Clients search field specified, or removed? (§2.2)
7. Should immediate and drafted filter groups coexist inside one popover? (§4.3)
8. Should applying a filter always reset pagination? (§4.2, §9.3)
9. Should selection be pruned when a selected record leaves the result set? (§6)
10. Which sort semantics win — header tri-state or chip two-state? (§7.2)
11. How is the Requirements Status column ordered, given it mixes status and attention labels? (§7.3)
12. What are the real page sizes, and does Candidates paginate at all? (§9.1)
13. Does select-all mean "this page" or "everything that matches"? (§10.2)
14. Should bulk "Move stage" pick the target in place rather than deferring to the board? (§10.4)
15. May a client with placements or invoices be deleted at all? (§10.4)
16. Are saved views shareable across the workspace, and who may share them? (§14)
17. Should the command palette run commands, or only navigate? (§15.2)
18. Which toast implementation is canonical, and do errors auto-dismiss? (§17.1)
19. Are outbound notifications deferred until the undo window closes? (§17.3)
20. Are AI coverage bands absolute counts, or relative to openings? (§3.3)

---

Next: Module 39 - Empty States, First-Run Experience & Onboarding Checklists

> **Open question:** the module sequence beyond 38 could not be confirmed against Module 01's module
> map, which is absent. The pointer above is PROPOSED - needs product sign-off and is derived from
> the first-run design screens that exist for Dashboard, Clients, Jobs, Candidates, Pipeline,
> Interviews and Placements.
