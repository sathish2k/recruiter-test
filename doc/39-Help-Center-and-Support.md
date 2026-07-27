# Module 39 - Help Center & Support

# 1. Overview

## 1.1 Purpose

The Help Center is the self-service knowledge surface of HirePilotX. Support is the
assisted channel behind it. Together they form one escalating path: a user reads, then
searches, then asks. This module specifies the article catalogue, the search behaviour,
the entry points that carry a user into help from wherever they are in the product, the
support channels available on each plan, the response commitments attached to those
plans, the escalation ladder, and the diagnostic context a support request must carry.

## 1.2 Scope

In scope:

- Help article and category model, lifecycle and visibility rules.
- Help Center search and the no-result path.
- Contextual help entry points from inside the application.
- Support channels, ticket model and ticket lifecycle.
- Plan-tiered first-response and resolution targets.
- Escalation tiers, triggers and breach handling.
- The diagnostic snapshot attached to a support request, and its redaction rules.

Out of scope:

- Authoring tooling and editorial workflow for HirePilotX staff (internal tooling).
- Billing disputes and refunds themselves — see Module 24 for placements/invoices; this
  module only routes such requests.
- Client-side messaging between an agency and its clients — that is the client portal
  message thread, not support.
- Status page and incident communications (see §11.4 open question).

## 1.3 Actors

| Actor | Role value | Interaction with this module |
|---|---|---|
| Workspace owner | `owner` | Reads all articles, raises tickets, sees every ticket in the workspace, is the addressee for plan and billing responses |
| Workspace administrator | `admin` | Reads all articles, raises tickets, sees every ticket in the workspace |
| Profile lead | `profileLead` | Reads all non-admin articles, raises tickets, sees own tickets |
| Recruiter | `recruiter` | Reads all non-admin articles, raises tickets, sees own tickets |
| Client portal user | `client` | Reads client-audience articles only, raises tickets against the agency, never sees agency-internal tickets |
| Support agent | (HirePilotX staff, not an agency role) | Responds to, reassigns and escalates tickets |

Role values follow the five-role target model referenced by Module 00. The legacy values
`admin | lead | employee | client` map to `admin | profileLead | recruiter | client`.

> **Open question — authoring baseline.** `doc/00-Glossary-and-Conventions.md` and
> `doc/01-Introduction-System-Overview.md` did not exist when this chapter was written,
> so no glossary values could be quoted. Every enum, identifier format and duration
> defined in this chapter is therefore module-local and must be reconciled against
> Module 00 before sign-off. Where this chapter and Module 00 disagree, Module 00 wins.
> Specifically to reconcile: the support-response entries in the SLA catalogue (§8), the
> ticket identifier format (§2.2), the business-hours and business-day definitions
> (§8.4), the plan enum (§8.1) and the role enum (§1.3).

## 1.4 Design intent

Help is a deflection surface first and a queue second. The rules below therefore
optimise for: (a) a user finding an answer without leaving the screen they are on,
(b) a support request arriving already carrying enough context that no round trip is
needed to establish what happened, and (c) a response time the user could predict before
they wrote the message.

---

# 2. Entities

## 2.1 Entity map

| Entity | Owner | Cardinality |
|---|---|---|
| `help_category` | HirePilotX (global) | 6 seeded categories, see §3.2 |
| `help_article` | HirePilotX (global) | Many per category; exactly one category each |
| `help_article_translation` | HirePilotX (global) | One per article per supported locale |
| `support_ticket` | Agency workspace | Many per workspace |
| `ticket_message` | Ticket | Many per ticket, ordered |
| `diagnostic_snapshot` | Ticket | Zero or one per ticket, immutable |
| `article_feedback` | Article | Many per article |
| `search_event` | Global | Many; drives the content-gap signal (§4.6) |

Help content is **global to the product**, not per agency: an article is authored once by
HirePilotX and read by every workspace. Tickets are **scoped to a workspace**.

## 2.2 Identifiers

| Entity | Format | Notes |
|---|---|---|
| `help_category` | `HC-<slug>` | Slug is stable and locale-independent, e.g. `HC-ai-screening` |
| `help_article` | `HA-<6-digit sequence>` | Immutable once assigned; survives retitling and re-categorisation |
| `support_ticket` | `TKT-<YYYY>-<6-digit sequence>` | Sequence resets each calendar year. PROPOSED - needs product sign-off |
| `ticket_message` | `TKM-<12-char opaque>` | Never shown to users |
| `diagnostic_snapshot` | `DGN-<12-char opaque>` | Referenced by ticket, never by URL |

> **Open question:** Module 00 is authoritative for ID formats. If it defines a single
> workspace-wide identifier convention, `TKT-<YYYY>-<sequence>` must be replaced by it.
> The year prefix is only justified if support volume is expected to exhaust a flat
> sequence, which is unlikely at current scale.

---

# 3. Article catalogue and structure

## 3.1 Article fields

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `article_id` | ID | Yes | `HA-<6-digit>`, immutable |
| `category_id` | ID | Yes | Exactly one category; changing it does not change `article_id` |
| `title` | Text (≤ 120 chars) | Yes | Sentence case. Must be answerable as a question or task, not a noun phrase |
| `summary` | Text (≤ 200 chars) | Yes | Shown in search results and in category listings |
| `body` | Rich text | Yes | Headings, ordered/unordered lists, tables, inline links, images, callouts |
| `keywords` | Text list | No | Search synonyms not present in the body; max 20 entries |
| `audience` | Enum | Yes | See §3.4 |
| `min_plan` | Enum | No | See §3.5. Null means all plans |
| `related_article_ids` | ID list | No | Max 5. Must resolve to `published` articles |
| `related_route_keys` | Text list | No | Drives contextual surfacing (§5.3) |
| `status` | Enum | Yes | See §3.3 |
| `locale_default` | Enum | Yes | Always `en` |
| `published_at` | Timestamp | Conditional | Required when `status` = `published` |
| `updated_at` | Timestamp | Yes | Shown to the reader as "Last updated" |
| `owner_team` | Text | Yes | Internal editorial ownership; never shown to users |
| `view_count` | Integer | Yes | Derived, read-only |
| `helpful_ratio` | Decimal 0–1 | Yes | Derived from `article_feedback`, read-only, null below 10 votes |

**Rules**

- R3.1.1 An article belongs to exactly one category. Cross-listing is not supported;
  use `related_article_ids` instead.
- R3.1.2 `title` must be unique within a category, case-insensitively.
- R3.1.3 An article whose `body` links to a route the reader's role cannot access must
  still render; the link degrades to plain text rather than 404ing the reader.
- R3.1.4 `related_article_ids` is not transitive and is not automatically reciprocal.

## 3.2 Seeded categories

Six categories, seeded at product launch. Counts below are the launch targets shown in
the Help Center design and are derived at runtime from published articles, not stored.

| `category_id` | Display label | Meaning / coverage | Launch article count |
|---|---|---|---|
| `HC-getting-started` | Getting started | Workspace setup, clients, roles and your first placement | 8 |
| `HC-sourcing-invites` | Sourcing & invites | Daily targets, the browser extension, AI keywords | 12 |
| `HC-ai-screening` | AI screening | Match scores, thresholds, what the AI reads in a CV | 7 |
| `HC-client-review` | Client review | The portal, approvals, submission SLAs and reports | 9 |
| `HC-interviews-offers` | Interviews & offers | Scheduling, calendar sync, scorecards, offer letters | 10 |
| `HC-admin-billing` | Admin & billing | Roles, permissions, audit log, plans and invoices | 11 |

**Rules**

- R3.2.1 The category set is fixed in v1. Agencies cannot add, rename, reorder or hide
  categories.
- R3.2.2 A category with zero published articles visible to the current reader is
  suppressed from the category grid rather than shown with a count of 0.
- R3.2.3 The displayed article count is the count of articles the **current reader** may
  see after `audience` and `min_plan` filtering (§3.4, §3.5), not the absolute count.
  Two users on different plans may legitimately see different counts for the same
  category.
- R3.2.4 Category coverage maps onto the functional modules as follows, and article
  content must not contradict them: `HC-client-review` → Module 19 (submissions and
  client approval); `HC-admin-billing` → Module 24 (placements and invoices) and
  Module 25 (commissions); `HC-getting-started` and `HC-sourcing-invites` →
  Module 00 §3 pipeline stages.
- R3.2.5 Any article that names a candidate pipeline stage must use the machine value
  and display label defined in Module 00 §3 verbatim. Articles may not introduce
  alternative stage vocabulary.

## 3.3 Article status

| Machine value | Display label | Meaning |
|---|---|---|
| `draft` | Draft | Authored, not visible to any user, not indexed |
| `in_review` | In review | Awaiting editorial sign-off, not visible to users |
| `published` | Published | Visible subject to `audience` and `min_plan`, indexed for search |
| `archived` | Archived | Withdrawn; not listed, not indexed; existing deep links resolve to a redirect target |

**Rules**

- R3.3.1 Only `published` articles are returned by search or listed in a category.
- R3.3.2 Archiving requires a `redirect_article_id` or an explicit "no replacement"
  acknowledgement. With a redirect, an inbound link to the archived article opens the
  replacement and states that the original was replaced. Without one, it opens the
  parent category with a notice.
- R3.3.3 An article referenced by any `related_route_keys` contextual entry point
  (§5.3) cannot be archived until that reference is removed or repointed. This is a hard
  block, not a warning.
- R3.3.4 Transitions are `draft → in_review → published → archived`, plus
  `in_review → draft` and `archived → published` (restore). `draft → published` directly
  is not permitted.

## 3.4 Article audience

| Machine value | Display label | Meaning |
|---|---|---|
| `all` | Everyone | Visible to every authenticated user including client portal users |
| `staff` | Agency staff | Visible to `owner`, `admin`, `profileLead`, `recruiter`; hidden from `client` |
| `client` | Client portal | Visible to `client` only; hidden from agency staff |
| `admin` | Administrators | Visible to `owner` and `admin` only |

**Rules**

- R3.4.1 Audience filtering is applied server-side before search ranking. An article the
  reader may not see must not influence result counts, ordering or the "no results"
  determination.
- R3.4.2 `audience` = `admin` is reserved for articles describing destructive or
  billing-affecting operations (role changes, workspace deletion, plan downgrade,
  invoice voiding per Module 24).
- R3.4.3 Audience is not a security control for the underlying feature. Hiding an
  article never substitutes for a permission check.

## 3.5 Plan gating of articles

| Machine value | Display label | Meaning |
|---|---|---|
| `free` | Free | No gate |
| `starter` | Starter | Visible on Starter and Pro |
| `pro` | Pro | Visible on Pro (including the 14-day Pro trial) |

**Rules**

- R3.5.1 An article describing a feature the workspace's plan does not include is still
  **listed and readable** by default. `min_plan` is set only where the article's content
  is meaningless without the feature.
- R3.5.2 When a gated article is opened by a workspace below `min_plan`, the article
  renders in full and carries an upgrade pointer. Content is not truncated. Rationale:
  help content is also pre-sales content.
- R3.5.3 `min_plan` never hides an article from `owner` or `admin`.

> **Open question:** R3.5.1 and R3.5.2 together mean `min_plan` affects only the upgrade
> pointer and the category count in R3.2.3, never readability. If product wants true
> gating, R3.5.2 must be rewritten and R3.2.3 revisited. PROPOSED as written - needs
> product sign-off.

## 3.6 Localisation

Supported locales follow the application language set: `en` (English), `hi` (हिन्दी),
`de` (Deutsch), `es` (Español).

**Rules**

- R3.6.1 `en` is the source locale. Every article exists in `en`.
- R3.6.2 A missing or stale translation falls back to `en` and the reader is told the
  article is shown in English.
- R3.6.3 A translation is `stale` when its source `en` article has been published more
  recently than the translation. Stale translations are still served with the fallback
  notice; they are not withheld.
- R3.6.4 Search indexes each locale separately. A query in `hi` searches the `hi` index
  and then the `en` index, merging results with locale-matched articles ranked first.
- R3.6.5 Article identifiers, category slugs and machine enum values are never
  translated.

## 3.7 Popular articles

The Help Center landing surface shows a "Popular right now" list beneath the category
grid.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `article_id` | ID | Yes | Must be `published` and visible to the reader |
| `rank` | Integer | Yes | 1-based; ties broken by `view_count` descending, then title ascending |

**Rules**

- R3.7.1 The list holds 5 entries. If fewer than 5 visible articles qualify, the list
  shortens; it is never padded with articles the reader cannot see.
- R3.7.2 Ranking is by article views over a trailing 7-day window across all workspaces,
  recomputed at least daily. It is not personalised in v1.
- R3.7.3 Editorial pinning may override up to 2 of the 5 slots. Pinned entries occupy
  the top ranks and are marked internally, not visibly.
- R3.7.4 Launch seed (used until 7 days of view data exist):

  1. How daily invite targets are counted (and edited per role)
  2. Setting a per-role AI match threshold
  3. What clients can and can't see in the portal
  4. Reassigning candidates when someone leaves
  5. Why a CV scored lower than expected — reading the AI report

> **Open question:** whether "popular" should be scoped to the reader's own workspace
> once a workspace has enough traffic. Global ranking is specified here because it is
> stable at low volume; per-workspace ranking would be more relevant but noisier.

---

# 4. Search

## 4.1 Behaviour

Search is the primary Help Center interaction. The landing surface presents a single
search field above the category grid.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `query` | Text (≤ 200 chars) | No | Free text. Empty query is the default state |
| `locale` | Enum | Yes | Derived from the user's language preference, not entered |

**Rules**

- R4.1.1 An empty query shows the full category grid and the "Popular right now" list.
  This is the default and idle state.
- R4.1.2 Search executes from the first character. There is no minimum query length and
  no submit action; results update as the query changes.
- R4.1.3 Input is debounced. PROPOSED: 250 ms - needs product sign-off.
- R4.1.4 Queries are matched case-insensitively and diacritic-insensitively.
- R4.1.5 A query returning results replaces the "Popular right now" list with the result
  list. The category grid remains visible so the user can abandon search for browsing.
- R4.1.6 Search never mutates state and requires no permission beyond being
  authenticated.

## 4.2 Search scope and ranking

Fields searched, in descending weight: `title`, `keywords`, `summary`, `body`,
category display label.

**Rules**

- R4.2.1 Results are ordered by relevance score descending, then `helpful_ratio`
  descending, then `updated_at` descending. The final two are deterministic tie-breakers,
  not primary signals.
- R4.2.2 An exact `title` match always ranks first.
- R4.2.3 Results are capped at 20 per query. There is no pagination in v1.
- R4.2.4 Only `published` articles passing the reader's `audience` filter are candidates
  (R3.4.1).
- R4.2.5 Search covers help articles only. It does not search candidates, requirements,
  clients or team members — that is the command palette's job (§5.2). The two search
  surfaces must not be merged.

## 4.3 Result fields

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `article_id` | ID | Yes | |
| `title` | Text | Yes | Match terms are highlighted |
| `category_label` | Text | Yes | Shown so the user can judge context before opening |
| `summary` | Text | No | Suppressed when the result list exceeds 10 entries |

## 4.4 No-result state

When a query matches no visible article, the result area states that no articles match
the query and offers a direct route to support.

**Rules**

- R4.4.1 The no-result state must name the query back to the user verbatim.
- R4.4.2 The no-result state must offer a contact-support action. This is the single
  most important deflection-failure handoff in the module.
- R4.4.3 Taking that action pre-fills the support request subject with the failed query
  and records `origin` = `help_search_no_result` on the ticket (§7.3).
- R4.4.4 The no-result state must not suggest "try different keywords" as its only
  remedy.

## 4.5 Search suggestions

The search field carries example queries as placeholder guidance ("invite targets",
"client portal") to teach the user that natural feature language works.

- R4.5.1 Placeholder examples are editorial content and must be kept in step with the
  seeded categories. They are translated per locale.
- R4.5.2 No autocomplete dropdown in v1. PROPOSED - needs product sign-off.

## 4.6 Content-gap signal

**Rules**

- R4.6.1 Every search producing zero results is recorded as a `search_event` with the
  query, locale, reader role, workspace plan and timestamp. The reader identity is not
  retained beyond role and plan.
- R4.6.2 Every search where the user opened no result within the session is recorded the
  same way, flagged `abandoned`.
- R4.6.3 These events are the editorial backlog input. They are not exposed to agencies.

---

# 5. Contextual help entry points

## 5.1 Principle

Help must be reachable without the user first knowing that a Help Center exists. Every
entry point below carries context forward so that the user lands on something narrower
than the Help Center home wherever that is possible.

## 5.2 Global entry points

| Entry point | Trigger | Behaviour | Context carried |
|---|---|---|---|
| Help control in the application bar | Direct activation | Opens the Help Center landing surface | Current route key (§5.3) |
| Command palette | `⌘K` on macOS, `Ctrl+K` elsewhere | Palette lists "Help Center" as a destination alongside candidates, requirements, clients, team and screens | Query text if typed |
| Keyboard shortcut overlay | `?` when not typing in a field | Lists the palette, the overlay itself, `Esc`, and the `G`-prefixed go-to shortcuts (`G D` dashboard, `G L` clients, `G C` candidates, `G J` jobs, `G I` interviews, `G S` settings) | None |
| Return-to-application control | Direct activation from the Help Center | Returns to the route the user came from | Originating route |

**Rules**

- R5.2.1 The Help Center is a full surface, not a modal. It is directly linkable and
  survives a page reload.
- R5.2.2 Opening the Help Center must not discard unsaved work on the originating
  screen. Where the originating screen holds a dirty form, the Help Center opens in a
  new context and the return control restores the form.
- R5.2.3 Keyboard shortcuts, including `?`, are suppressed while the user is typing in a
  text field, text area or editable region.
- R5.2.4 The command palette is a navigation and record-search tool. It surfaces the
  Help Center as a destination but does not return article results (R4.2.5).

## 5.3 Route-scoped contextual help

An article may declare `related_route_keys`. When a user opens help from a route listed
in an article's `related_route_keys`, that article is promoted.

**Rules**

- R5.3.1 On opening the Help Center from a route with matching articles, those articles
  are shown in a leading "For this screen" group above the category grid, capped at 3.
- R5.3.2 The group is suppressed entirely when no article matches. It is never shown
  empty or padded with generic articles.
- R5.3.3 Route-scoped promotion is overridden the moment the user types a query.
- R5.3.4 `related_route_keys` are functional route keys, not URLs; a route key survives
  a URL change.

## 5.4 In-context entry points

PROPOSED - needs product sign-off. The design evidences only the global entry points in
§5.2; the following are specified because the deflection model in §1.4 depends on them.

| Location | Trigger | Target |
|---|---|---|
| First-run and empty-state screens | Inline link | `HC-getting-started` category, or a named article for that object type |
| Permission-denied screen | Inline link | Article explaining role-based visibility, plus the workspace administrator contact |
| Not-found screen | Inline link | Help Center landing surface |
| AI screening report | Inline link on the score explanation | "Why a CV scored lower than expected — reading the AI report" |
| Client portal | Inline link | `client`-audience articles only (R3.4.1) |
| Plan and billing surfaces | Inline link | `HC-admin-billing`, and the billing contact address (§6.2) |
| Field-level hints on complex fields | Hover or focus affordance | Inline explanation, with an optional article link |

**Rules**

- R5.4.1 An in-context entry point must resolve to a specific article or category, never
  to the Help Center home. If no specific target exists, the entry point is not shown.
- R5.4.2 An in-context entry point pointing at an archived article must fail closed: the
  entry point is hidden, not shown pointing at a redirect (see also R3.3.3).
- R5.4.3 In-context entry points are never modal-blocking and never interrupt a task.

> **Open question:** whether field-level hints are authored in this module's article
> store or alongside the field definitions in their owning module. Storing them here
> gives one editorial pipeline and translation path; storing them with the field keeps
> them accurate. No decision recorded in the designs.

---

# 6. Support channels

## 6.1 Channel catalogue

| Machine value | Display label | Meaning | Diagnostics attached |
|---|---|---|---|
| `email_support` | Email support | Message sent to the general support address | No (§9.5) |
| `email_billing` | Billing enquiry | Message sent to the billing address | No |
| `in_app_ticket` | Message support | Ticket raised from inside the application | Yes |
| `priority_queue` | Priority support | Routing modifier, not a separate channel; see §8 | Inherits from origin channel |

Addresses: general support `support@hirepilotx.com`; billing `billing@hirepilotx.com`.

## 6.2 Channel availability by plan

| Plan | `email_support` | `email_billing` | `in_app_ticket` | `priority_queue` |
|---|---|---|---|---|
| `free` | Yes | Yes | Yes | No |
| `starter` | Yes | Yes | Yes | No |
| `pro` | Yes | Yes | Yes | Yes |
| Pro trial (14 days) | Yes | Yes | Yes | Yes |

**Rules**

- R6.2.1 No plan is denied a support channel. Plan determines response speed and routing
  (§8), never access.
- R6.2.2 The Pro trial confers Pro support treatment for its full 14 days. On trial
  expiry without conversion, open tickets keep the response target they were created
  under; new tickets fall back to the post-trial plan.
- R6.2.3 Billing, invoice and commission questions route to `email_billing` regardless
  of the channel they arrive on. See Module 24 for invoices and Module 25 for
  commissions; support does not adjudicate either, it routes.

## 6.3 In-app ticket composer

PROPOSED - needs product sign-off. The design's "Message support" action resolves to a
mail client. A mail client cannot carry the diagnostic snapshot specified in §9, so an
in-application composer is specified as the primary path with the mail address retained
as the fallback for users who cannot reach the application at all.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `subject` | Text (≤ 150 chars) | Yes | Pre-filled from the failed search query when `origin` = `help_search_no_result` (R4.4.3) |
| `body` | Text (≤ 10,000 chars) | Yes | Plain text |
| `category` | Enum | Yes | See §7.2 |
| `severity_requested` | Enum | Yes | See §8.2. User-stated, not binding |
| `attachments` | File list | No | Max 5 files, max 10 MB each. See §9.6 for permitted content |
| `related_entity_ref` | Entity reference | No | A candidate, requirement, client, submission, interview, placement or invoice. Stored as type + identifier only |
| `diagnostics_consent` | Boolean | Yes | Defaults to true; see §9.4 |
| `cc_workspace_admins` | Boolean | No | Defaults to false |

**Rules**

- R6.3.1 The composer is available from every authenticated route, including error
  screens, provided the application shell has loaded.
- R6.3.2 Submitting the composer creates a `support_ticket` in status `new` and an
  immutable `diagnostic_snapshot` (§9), unless `diagnostics_consent` is false.
- R6.3.3 The composer must state the response target that applies to this workspace's
  plan (§8.1) **before** submission, not after.
- R6.3.4 A draft composer survives navigation within the session.
- R6.3.5 A `client` user's ticket is raised against the agency workspace they belong to
  and is visible to that agency's `owner` and `admin`, not to other clients.

## 6.4 Response and notification

- R6.4.1 Every ticket state change that requires user attention produces a notification
  through the user's configured notification channels.
- R6.4.2 A ticket reply is always delivered by email as well as in-application, because
  the triggering problem may be that the application is unreachable.
- R6.4.3 Replying to that email appends a `ticket_message` to the ticket rather than
  opening a new ticket, matched on the ticket identifier.

---

# 7. Support ticket model

## 7.1 Ticket fields

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `ticket_id` | ID | Yes | `TKT-<YYYY>-<6-digit>`, immutable, shown to the user |
| `workspace_id` | ID | Yes | The agency workspace; immutable |
| `requester_user_id` | ID | Yes | Immutable |
| `requester_role` | Enum | Yes | Snapshot at creation; not re-evaluated if the role later changes |
| `plan_at_creation` | Enum | Yes | Snapshot at creation. Determines the response target for the ticket's whole life (R8.1.3) |
| `channel` | Enum | Yes | See §6.1 |
| `origin` | Enum | Yes | See §7.3 |
| `category` | Enum | Yes | See §7.2 |
| `severity` | Enum | Yes | Agent-assigned; initialised from `severity_requested` |
| `status` | Enum | Yes | See §7.4 |
| `escalation_tier` | Enum | Yes | See §10.1. Initial value `tier_1` |
| `subject` | Text | Yes | |
| `related_entity_ref` | Entity reference | No | |
| `diagnostic_snapshot_id` | ID | No | Absent for email-origin tickets |
| `created_at` | Timestamp | Yes | Starts the first-response clock (§8.4) |
| `first_response_at` | Timestamp | No | Set once, on the first agent `ticket_message` |
| `first_response_target_at` | Timestamp | Yes | Computed at creation from `plan_at_creation` and `severity` |
| `resolved_at` | Timestamp | No | Set on entry to `resolved` |
| `closed_at` | Timestamp | No | Set on entry to `closed` |
| `sla_breached` | Boolean | Yes | Derived; see R8.4.4 |
| `reopen_count` | Integer | Yes | Defaults to 0 |

## 7.2 Ticket category

| Machine value | Display label | Meaning |
|---|---|---|
| `how_to` | How do I…? | Usage question with an existing correct answer |
| `bug` | Something is broken | Behaviour contradicts the specification |
| `data_issue` | Wrong or missing data | Records, counts, scores or pipeline state look incorrect |
| `access` | Access & permissions | Cannot reach a screen, action or workspace |
| `billing` | Billing & plan | Plan, invoice, credit or payment question. Routes per R6.2.3 |
| `integration` | Integrations | Calendar, email, extension or third-party connection |
| `ai_quality` | AI results | Match score, screening output or generated content is wrong or unexplained |
| `security` | Security & privacy | Suspected breach, data exposure, or a data-subject request. Bypasses normal routing (R10.3.2) |
| `feature_request` | Feature request | No fix expected; routed to product, exempt from resolution targets |
| `other` | Something else | Fallback; agent must re-categorise before first response |

## 7.3 Ticket origin

| Machine value | Display label | Meaning |
|---|---|---|
| `help_search_no_result` | From a failed search | Raised from the no-result state (R4.4.3) |
| `help_article` | From an article | Raised from the "still stuck" path on an article |
| `help_center_home` | From the Help Center | Raised from the landing surface |
| `in_context` | From the app | Raised from an in-context entry point (§5.4); carries the originating route key |
| `error_screen` | From an error screen | Raised from a permission-denied, not-found or failure state; carries the error code |
| `email` | By email | Arrived at a support address |

## 7.4 Ticket status

| Machine value | Display label | Meaning |
|---|---|---|
| `new` | New | Created, not yet picked up. First-response clock running |
| `open` | Open | An agent owns it and is working. Clock running until `first_response_at` is set |
| `awaiting_customer` | Awaiting your reply | Agent has asked a question. Resolution clock paused |
| `escalated` | Escalated | Moved beyond tier 1 (§10). Clocks continue |
| `resolved` | Resolved | Agent believes it is answered or fixed; reopenable |
| `closed` | Closed | Terminal. Not reopenable |

**Rules**

- R7.4.1 Permitted transitions:
  `new → open`, `new → escalated`, `open → awaiting_customer`, `open → escalated`,
  `open → resolved`, `awaiting_customer → open`, `awaiting_customer → closed`,
  `escalated → open`, `escalated → resolved`, `resolved → open`, `resolved → closed`.
  Any other transition is rejected.
- R7.4.2 `resolved → open` is a reopen. It increments `reopen_count` and is permitted
  only within 14 calendar days of `resolved_at`. After that the user must raise a new
  ticket, which must be linked to the original.
- R7.4.3 `awaiting_customer → closed` occurs automatically after 10 calendar days with
  no customer reply. The user is warned at 7 days. PROPOSED - needs product sign-off.
- R7.4.4 `resolved → closed` occurs automatically 14 calendar days after `resolved_at`.
- R7.4.5 A ticket in `awaiting_customer` does not accrue elapsed resolution time
  (R8.4.3). It does not pause the first-response clock, because by definition first
  response has already occurred.
- R7.4.6 Deleting a ticket is not supported. Data-subject erasure is handled under §11.3
  and is recorded, not silent.

---

# 8. Plan-tiered response targets

## 8.1 First-response targets

| Plan | Display label | First-response target | Source |
|---|---|---|---|
| `pro` | Pro | 4 business hours | Stated in the Help Center design |
| `starter` | Starter | 1 business day | PROPOSED - needs product sign-off |
| `free` | Free | 2 business days | PROPOSED - needs product sign-off |

**Rules**

- R8.1.1 The target is a **first human response**, not a resolution. An automated
  acknowledgement never satisfies it.
- R8.1.2 The applicable target must be stated to the user before they submit (R6.3.3)
  and restated on the ticket after submission.
- R8.1.3 `plan_at_creation` fixes the target for the ticket's whole life. Upgrading mid-
  ticket does not accelerate an existing ticket; downgrading does not slow one. This
  makes the commitment made at submission time honest.
- R8.1.4 Pro trial workspaces receive the `pro` target (R6.2.2).

> **Open question:** Module 00 holds the authoritative SLA catalogue. It is not
> established whether that catalogue covers support response at all, or only operational
> SLAs such as the client submission SLA in Module 19. If support targets belong in the
> Module 00 catalogue, §8.1 and §8.3 must be replaced by references to it and only the
> Pro figure (4 business hours) survives as a design-sourced fact.

## 8.2 Severity

| Machine value | Display label | Meaning |
|---|---|---|
| `p1_critical` | Critical — work is stopped | Workspace unusable, data loss, security exposure, or an active placement or invoice is blocked |
| `p2_high` | High — a workflow is blocked | A core workflow fails and has no workaround |
| `p3_normal` | Normal | Something is wrong or unclear but work continues |
| `p4_low` | Low | Cosmetic, editorial, or a question with no time pressure |

**Rules**

- R8.2.1 `severity_requested` is the user's statement. `severity` is the agent's
  assessment and is the value that drives targets and escalation.
- R8.2.2 Severity may be revised in either direction at any time. Raising it recomputes
  `first_response_target_at` from `created_at`, which may put the ticket immediately in
  breach; that is intended and must be recorded rather than suppressed.
- R8.2.3 Lowering severity never moves `first_response_target_at` later. Targets are
  ratchets in the user's favour.
- R8.2.4 `category` = `security` is treated as at least `p2_high` regardless of the
  stated severity, and `p1_critical` where data exposure is claimed.

## 8.3 Severity modifier on the first-response target

PROPOSED - needs product sign-off.

| Severity | `free` | `starter` | `pro` |
|---|---|---|---|
| `p1_critical` | 4 business hours | 2 business hours | 1 business hour |
| `p2_high` | 1 business day | 4 business hours | 2 business hours |
| `p3_normal` | 2 business days | 1 business day | 4 business hours |
| `p4_low` | 3 business days | 2 business days | 1 business day |

- R8.3.1 The plan target in §8.1 is the `p3_normal` row. Severity shortens it; it never
  lengthens it beyond the plan target for `p3_normal` except for `p4_low`.
- R8.3.2 `p1_critical` targets apply outside business hours as elapsed clock hours for
  `pro` only. PROPOSED - needs product sign-off.

## 8.4 Clock rules

**Rules**

- R8.4.1 A **business day** and **business hours** follow the definitions in Module 00.
  Where Module 00 defines a fiscal calendar but not a support calendar, the support
  calendar is PROPOSED as Monday to Friday, 09:00–18:00, in the support organisation's
  operating time zone, excluding published holidays.
- R8.4.2 The first-response clock starts at `created_at` and stops at
  `first_response_at`. It does not pause for any status.
- R8.4.3 Elapsed resolution time excludes all periods in `awaiting_customer` (R7.4.5).
- R8.4.4 `sla_breached` is true when `first_response_at` is later than
  `first_response_target_at`, or when the target has passed with `first_response_at`
  unset. It is never cleared once set, including on reopen.
- R8.4.5 A reopened ticket gets a fresh first-response target computed from the reopen
  timestamp, tracked separately from the original. The original breach flag stands.
- R8.4.6 Tickets with `category` = `feature_request` are exempt from resolution targets
  but not from the first-response target.
- R8.4.7 Breach is reported internally. It is not surfaced to the requester as a flag,
  because doing so invites disputes without giving the user a remedy. PROPOSED - needs
  product sign-off.

> **Open question:** no remedy or credit is defined for a missed target. If the response
> time is to be a commitment rather than an aspiration, product must decide whether a
> breach entitles the workspace to anything, and Module 24 must then carry the credit
> mechanism.

---

# 9. Diagnostic context

## 9.1 Principle

A support request raised from inside the product must arrive carrying enough machine-
gathered context that the agent's first message can be an answer rather than a question.
The snapshot is captured once, at submission, and is immutable thereafter.

## 9.2 Snapshot contents

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `snapshot_id` | ID | Yes | `DGN-<12-char opaque>` |
| `captured_at` | Timestamp | Yes | Submission time, not composer-open time |
| `workspace_id` | ID | Yes | |
| `workspace_plan` | Enum | Yes | Plan and billing period (monthly or annual), plus trial state and trial end date |
| `user_id` | ID | Yes | |
| `user_role` | Enum | Yes | |
| `user_locale` | Enum | Yes | One of `en`, `hi`, `de`, `es` |
| `origin_route_key` | Text | Yes | The functional route the user was on |
| `origin_entity_ref` | Entity reference | No | Type + identifier of the record in view |
| `app_version` | Text | Yes | Build identifier of the running client |
| `api_version` | Text | Yes | Version the client last spoke to |
| `platform` | Enum | Yes | `web`, `desktop`, `browser_extension` |
| `client_environment` | Text | Yes | Browser or host application and version, operating system, viewport dimensions |
| `session_id` | Opaque ID | Yes | Correlates to server-side request logs |
| `last_error` | Object | No | Error code, correlation ID and timestamp of the most recent client-visible failure |
| `recent_actions` | Object list | Yes | Last 20 user actions as route key + action name + timestamp. No field values (§9.3) |
| `recent_request_ids` | ID list | Yes | Correlation IDs of the last 20 API calls, with status codes and durations |
| `feature_flags` | Text list | Yes | Flags active for this workspace |
| `integration_status` | Object list | Yes | Each configured integration with its connection state and last successful sync time |
| `ai_context` | Object | No | AI credit balance, credits consumed in the current period, AI provider mode (hosted, bring-your-own, local), and the operation ID of the last AI run. Required when `category` = `ai_quality` |
| `permission_summary` | Object | Yes | The resource-to-actions map in force for this user. Required to answer `access` tickets without a round trip |
| `pipeline_context` | Object | No | Where `origin_entity_ref` is a candidate, the candidate's current pipeline stage using the Module 00 §3 machine value, and the timestamp of the last stage transition |

**Rules**

- R9.2.1 The snapshot is captured server-side where the value is server-known
  (`workspace_plan`, `permission_summary`, `feature_flags`, `integration_status`) and
  client-side only where it cannot be (`client_environment`, `recent_actions`,
  `last_error`). Client-supplied values are recorded as claims and are never trusted for
  authorisation.
- R9.2.2 `pipeline_context` must quote the Module 00 §3 stage machine value exactly. It
  must not carry a derived or display-only stage description.
- R9.2.3 A snapshot is immutable. Corrections are made by adding a `ticket_message`, not
  by rewriting the snapshot.
- R9.2.4 The snapshot is never editable by, or fully visible to, the requester. A
  summary of what was captured is shown before submission (R9.4.1).

## 9.3 What is never captured

**Rules**

- R9.3.1 The snapshot never contains: passwords, session tokens, API keys, bring-your-own
  AI provider credentials, or any authentication material.
- R9.3.2 The snapshot never contains CV or document file contents, candidate contact
  details, interview notes, scorecard text or message bodies. Records are referenced by
  type and identifier only.
- R9.3.3 The snapshot never contains commercial values — fee percentages, salary figures,
  invoice amounts or commission calculations (Module 24, Module 25) — unless `category`
  = `billing`, in which case the invoice identifier alone is carried, not the amounts.
- R9.3.4 `recent_actions` records the action taken, never the values entered. A form
  submission is recorded as the action and its route key; the payload is not recorded.
- R9.3.5 Free-text fields the user wrote themselves (`subject`, `body`, attachments) are
  the user's own disclosure and are outside these rules. The composer must warn the user
  not to paste credentials.

## 9.4 Consent and transparency

**Rules**

- R9.4.1 Before submission the composer states, in plain language, the categories of
  context that will be attached: who you are, what plan you are on, which screen you
  were on, which record you were looking at, what the app last did, and what errors it
  saw.
- R9.4.2 `diagnostics_consent` defaults to true and may be withdrawn at composition time.
- R9.4.3 Withdrawing consent submits the ticket without a snapshot and records
  `diagnostic_snapshot_id` as absent. The user is told this will slow the response. The
  ticket is not refused and its response target does not change.
- R9.4.4 Consent applies to one ticket. It is not remembered across tickets.

## 9.5 Email-origin tickets

**Rules**

- R9.5.1 A ticket with `channel` = `email_support` or `email_billing` has no snapshot.
- R9.5.2 The agent's first action on such a ticket is to establish workspace and user
  identity. The response target still applies.
- R9.5.3 Where the user can reach the application, the agent should direct them to the
  in-app composer so that a snapshot exists. This does not create a new ticket; the
  existing ticket is linked to the newly captured snapshot.

## 9.6 Attachments

**Rules**

- R9.6.1 Permitted: screenshots, screen recordings, exported reports, and files the user
  was attempting to upload when the failure occurred.
- R9.6.2 Attachments are stored against the ticket, inherit the ticket's retention period
  (§11.3), and are access-controlled to the requester, the workspace `owner` and `admin`,
  and assigned support staff.
- R9.6.3 The composer must warn that screenshots may contain candidate personal data
  before the user attaches one.

---

# 10. Escalation

## 10.1 Escalation tiers

| Machine value | Display label | Meaning |
|---|---|---|
| `tier_1` | Support | First-line support agent. Owns the ticket by default and answers `how_to`, `access` and most `data_issue` tickets |
| `tier_2` | Specialist | Product or domain specialist. Owns `ai_quality`, `integration`, complex `data_issue` and confirmed `bug` triage |
| `tier_3` | Engineering | Engineering on-call. Owns reproducible defects, data corruption and outages |
| `tier_billing` | Billing | Owns `billing`; a lateral route, not a rank |
| `tier_security` | Security | Owns `security`; a lateral route, not a rank |

## 10.2 Escalation triggers

| Trigger | Condition | Effect |
|---|---|---|
| Severity | `severity` = `p1_critical` | Immediate `tier_2`; `tier_3` if not diagnosed within 1 business hour |
| Category | `category` = `security` | Immediate `tier_security`, bypassing tiers 1–3 |
| Category | `category` = `billing` | Immediate `tier_billing` |
| Target breach | `first_response_target_at` passed with no first response | Automatic escalation one tier and an internal alert |
| Age | `open` for more than 3 business days with no resolution path | Escalation one tier |
| Reopen | `reopen_count` reaches 2 | Escalation one tier; the same agent may not own the third attempt |
| Manual | Agent judgement | Escalation one tier, with a recorded reason |
| Requester | Workspace `owner` requests escalation | Escalation one tier, once per ticket |

## 10.3 Escalation rules

- R10.3.1 Escalation moves ownership one tier at a time except where §10.2 specifies a
  direct route. Skipping tiers without a specified trigger is not permitted.
- R10.3.2 `tier_security` and `tier_billing` are lateral routes. A ticket entering either
  does not pass through tiers 1–3 and does not return to them; it resolves within that
  route.
- R10.3.3 Escalation never resets, pauses or extends any clock (R8.4.2). The originally
  computed target stands.
- R10.3.4 Escalation sets `status` = `escalated` and requires a handover note naming what
  has been established and what is still unknown. A handover without that note is
  rejected.
- R10.3.5 De-escalation back to a lower tier is permitted and sets `status` = `open`.
- R10.3.6 Only the workspace `owner` may request escalation on behalf of the workspace,
  and only once per ticket, to keep the trigger meaningful.
- R10.3.7 A ticket that reaches `tier_3` and is confirmed as a defect must carry a defect
  reference. The ticket may be `resolved` on delivery of a workaround; it may not be
  `closed` while the defect reference is open unless the requester agrees.
- R10.3.8 Escalation state is internal. The requester is told that their request has been
  escalated and to which broad function, not the tier value.

> **Open question:** whether a workspace should be able to see the escalation state of
> its own tickets in the application at all, or only receive it in agent replies. R10.3.8
> assumes the latter. PROPOSED - needs product sign-off.

---

# 11. Permissions, privacy and retention

## 11.1 Article visibility

Governed by §3.4 (`audience`) and §3.5 (`min_plan`). No additional permission key is
required to read help content beyond authentication.

## 11.2 Ticket visibility

| Role | Own tickets | Other users' tickets in the workspace | Diagnostic snapshot |
|---|---|---|---|
| `owner` | Read, reply, escalate | Read, reply | Summary only (R9.2.4) |
| `admin` | Read, reply | Read, reply | Summary only |
| `profileLead` | Read, reply | No | Summary only |
| `recruiter` | Read, reply | No | Summary only |
| `client` | Read, reply | No | Summary only |

**Rules**

- R11.2.1 A `client` user's tickets are visible to the agency `owner` and `admin` because
  the agency is accountable for its client's experience. The client is told this at
  composition time.
- R11.2.2 A ticket raised by a user who subsequently leaves the workspace remains visible
  to `owner` and `admin` and is reassigned to the `owner` as requester of record.
- R11.2.3 No agency role may read another workspace's tickets under any circumstances.

## 11.3 Retention

| Data | Retention | Notes |
|---|---|---|
| `support_ticket` and `ticket_message` | 24 months from `closed_at` | PROPOSED - needs product sign-off |
| `diagnostic_snapshot` | 90 days from `captured_at` | Purged independently of the ticket; the ticket then records that a snapshot existed and was purged |
| Attachments | Same as the parent ticket | |
| `search_event` | 12 months | Query text only; no user identity (R4.6.1) |
| `article_feedback` | Indefinite | Aggregate only |

**Rules**

- R11.3.1 A data-subject erasure request removes the requester's identity from tickets
  and messages and purges any snapshot, retaining the ticket shell for audit.
- R11.3.2 Workspace deletion closes all open tickets and starts the retention clock.
  Tickets are not deleted with the workspace, because billing and security tickets may
  outlive it.
- R11.3.3 Snapshot purging is unconditional and is not deferred by an open ticket.

## 11.4 Audit

- R11.4.1 The following are audit events in the workspace audit log: ticket created,
  ticket status changed, escalation requested by a workspace user, diagnostics consent
  withheld, attachment added.
- R11.4.2 Agent-side actions (assignment, internal notes, tier changes) are audited
  internally and are not written to the workspace audit log.

> **Open question:** incident and outage communication is not specified anywhere in the
> designs. When the product itself is down, the Help Center and the in-app composer are
> both unavailable, so an out-of-band channel is required. A status page and a
> subscription mechanism are PROPOSED but neither is designed - needs product sign-off.

---

# 12. Analytics and content health

| Metric | Definition | Purpose |
|---|---|---|
| Deflection rate | Sessions that opened help and did not raise a ticket, over all sessions that opened help | Primary measure of §1.4 |
| No-result rate | Zero-result searches over all searches | Editorial backlog input (R4.6.3) |
| Article helpfulness | `helpful_ratio` per article, suppressed below 10 votes | Rewrite candidates |
| Ticket volume by `category` and `origin` | Count per period | Identifies which product surfaces generate support load |
| First-response attainment | Tickets responded to within `first_response_target_at`, by plan | Measures §8 |
| Escalation rate | Tickets leaving `tier_1`, by category | Measures tier-1 tooling and article coverage |

**Rules**

- R12.1 Article feedback is a single binary "was this helpful" with an optional free-text
  comment. The comment is editorial input, not a support request, and does not create a
  ticket.
- R12.2 A "no" vote must offer the contact-support path (as R4.4.2 does for search).
- R12.3 These metrics are internal to HirePilotX. Agencies see their own ticket list,
  not aggregate analytics.

---

# 13. Summary of open questions and proposals

| Ref | Item | State |
|---|---|---|
| §1.4 | Module 00 and Module 01 unavailable at authoring time; all enums, ID formats and durations here are provisional | Open question |
| §2.2 | `TKT-<YYYY>-<sequence>` identifier format | Open question |
| §3.5 | Whether `min_plan` truly gates readability | PROPOSED |
| §3.7 | Global versus per-workspace "popular" ranking | Open question |
| §4.1 | 250 ms search debounce | PROPOSED |
| §4.5 | No autocomplete in v1 | PROPOSED |
| §5.4 | In-context entry point catalogue | PROPOSED |
| §5.4 | Where field-level hints are authored | Open question |
| §6.3 | In-app composer replacing the mail-client action | PROPOSED |
| §7.4 | 10-day auto-close from `awaiting_customer` | PROPOSED |
| §8.1 | `free` and `starter` first-response targets | PROPOSED |
| §8.1 | Whether support targets belong in the Module 00 SLA catalogue | Open question |
| §8.3 | Severity modifier table; out-of-hours `p1_critical` handling | PROPOSED |
| §8.4 | Support business-hours calendar | PROPOSED |
| §8.4 | Breach not surfaced to the requester | PROPOSED |
| §8.4 | Remedy or credit for a missed target | Open question |
| §10.3 | Whether escalation state is visible to the workspace | PROPOSED |
| §11.3 | 24-month ticket retention | PROPOSED |
| §11.4 | Status page and out-of-band incident communication | Open question |

---

Next: Module 40 - Release Notes & Product Changelog

> **Open question:** Module 01 was unavailable, so the module numbering beyond 39 could
> not be confirmed. The pointer above is PROPOSED - needs product sign-off.
