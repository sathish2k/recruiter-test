# Documentation Gap Analysis

Audit of `doc/*.md` (11 functional-spec files) against the 26 in-app product
designs in the Claude Design project. Generated 2026-07-26.

---

# DOCUMENTATION GAP AUDIT — HirePilotX doc/ vs. 26 design screens

The doc describes a **CRUD ATS**: workspace → members → clients → contacts → jobs → candidates. The designs describe an **agency operations system**: a sourcing funnel, a review-and-submit funnel, a client-facing portal, a money funnel (offer → placement → invoice → commission), and an automation/AI layer that drives all three. Roughly **60–70% of the designed product has no documentation at all**, and the 30% that is documented is specified at a shallower depth than every design screen.

---

# 1. MISSING MODULES

Ordered by size of gap. "Never mentioned" = no chapter and no reference; "named only" = the doc lists the word but gives zero spec.

| # | Module | Doc state | One-line description | Entities it needs | Proposed chapter |
|---|---|---|---|---|---|
| 1 | **Sourcing & Outreach** | **Never mentioned** | The entire front half of the funnel — LinkedIn/Naukri/Indeed/Wellfound invites, connection acceptance, JD sharing, nudges, per-user daily invite targets, auto-logging. Drives Employee Dashboard, Team Activity, Commissions and half of Analytics. | `SourcingActivity/InviteLog`, `DailyInviteTarget`, `Connection`, `JDShare`, `SourcedProfile`, `RoleAssignment` | **11** |
| 2 | **Sourcing Plugin / Browser Extension** | **Never mentioned** | Chrome side panel that parses a profile on LinkedIn/Indeed/Naukri/Wellfound, dedupe-checks against the ATS, AI-ranks it against open roles, reveals masked contact details, sends a templated invite and writes the candidate + activity back. | `SourceSite/Connector`, `DuplicateCheck`, `ContactEnrichment`, `CandidateJobMatch` (pre-CV), `InviteNoteTemplate`, `ExtensionSession` | **12** |
| 3 | **Submissions & Client Review** | Named only ("Submit Candidate", 4 lines in UserFlow §11) | The core commercial object: a candidate presented to a client for a role, with a packaged profile, an AI summary, masking flags, a 48h/3-day decision SLA, reminders/nudges, and a client decision with reason. Referenced by 12+ design screens; has no entity in the doc. | `Submission`, `SubmissionPackage`, `ClientDecision`, `SubmissionSLA`, `Reminder/Nudge`, `RecommendationNote` | **16** |
| 4 | **Client Portal (external)** | **Never mentioned** | Tokenised, passwordless page where a client contact reviews submitted candidates and approves/declines, plus the magic-link login. A whole second application with its own auth, audience and visibility model. | `PortalShareLink`, `MagicLinkToken`, `PortalSession`, `ClientPortalUser`, `PortalVisibilityRule` | **17** |
| 5 | **CV Review (Lead queue)** | **Never mentioned** | The profile lead's dedicated review surface: queue of AI-scored CVs, CV-vs-match-report side by side, must-have checklist, submit-to-client or send-back-to-sourcer with a required reason. | `ReviewQueueItem`, `ReviewDecision`, `SendBackReason`, `MatchReport` | **14** |
| 6 | **AI Screening** | Declared as "Module 9/11", **no file** | Scoring engine + control panel: workspace threshold, per-role overrides, score-on-upload, auto-forward to lead, verdict bands, score distribution, quota, audit list of every run. | `ScreeningSettings`, `ScreeningRun/Result`, `ScoreBand`, `AIQuota/Credit`, `ScoringWeights` | **13** |
| 7 | **Placements, Invoices & Guarantee** | Named only (2 fields) | The money end: offer→join→placement→invoice→paid, 90-day replacement guarantee clock, fees by client, outstanding balances. Invoice appears in the doc **only as a number prefix**. | `Placement`, `Invoice`, `Guarantee`, `FeeAgreement`, `PaymentTerms` | **21** |
| 8 | **Commissions & Payouts** | **Never mentioned** | Sourcer 7% / profile lead 5% of placement fee, accrued on placement, released when the client invoice is paid, payout runs and per-member ledgers. | `Commission`, `CommissionRate` (per role), `PayoutRun`, `CommissionLedger` | **22** |
| 9 | **Interviews & Scheduling** | Declared as a module, **no file**; 8 field names in UserFlow | Interview ops hub (Today/Week/Past), full scheduling form with panel availability conflict detection, self-schedule links, calendar two-way sync, modes, reminders, assessment templates. | `Interview`, `InterviewRound`, `PanelMember`, `AvailabilitySlot`, `SelfScheduleLink`, `CalendarConnection`, `MeetingLink` | **18** |
| 10 | **Interview Feedback & Scorecards** | 2 fields (Score, Recommendation) | Assessment templates (versioned), per-criterion 1–5 scoring, verdict, due date + overdue state, morning-of delivery. | `AssessmentTemplate`, `Scorecard`, `ScorecardCriterion`, `Verdict` | **19** |
| 11 | **Pipeline Board** | Stage list only (09 §14) | Kanban of candidate×job with drag transitions, per-stage SLA and WIP capacity, sub-statuses, move-modal comments, undo, bulk actions, AI move recommendations, focus facets. | `Pipeline`, `Stage` (sla, cap, statuses), `StageStatus`, `StageTransition`, `Flag/Tag`, `AIRecommendation` | **15** |
| 12 | **Notifications** | **Never mentioned** | Typed, prioritised, groupable feed with inline CTAs, snooze/mute/archive, 90-day history, preference centre. | `Notification`, `NotificationPreference`, `NotificationDigest` | **24** |
| 13 | **Messages / Inbox** | **Never mentioned** | 3-pane candidate + team messaging with attachments, read receipts, canned templates, CV-in-thread auto-scoring. | `Conversation`, `Message`, `MessageAttachment`, `MessageTemplate`, `ReadReceipt` | **23** |
| 14 | **Automation** | **Never mentioned** | Trigger→condition→action recipe library (score on upload, forward strong CVs, CV nudge, daily digest, interview reminders, client decision reminder), templates, run log with retry, impact metrics. | `Automation`, `AutomationTemplate`, `AutomationRun`, `AutomationImpact` | **25** |
| 15 | **Dashboards (Owner / Lead / Employee)** | Nav item only | Three role-scoped home screens with different KPIs, queues and navigation. The doc never specifies a single dashboard widget. | `PriorityTask`, `ActivityEvent`, `FunnelSnapshot`, `RequirementHealth`, `Trial` | **26** |
| 16 | **Analytics & Reports** | Declared as "Module 13", no file | Funnel, fill rate, time-to-fill trend, source effectiveness + cost-per-hire, per-client fill rate, recruiter leaderboard, fiscal periods, Client Report artifact, Weekly AI Report. | `Source/Channel` (+cost), `ClientFillMetrics`, `RecruiterMetrics`, `ClientReport`, `WeeklyAIReport`, `ReportExport` | **27** |
| 17 | **Team Activity** | **Never mentioned** | Per-employee and per-role-assignment sourcing output with admin-vs-lead data scoping. | `Assignment` (role, client, employee, lead, counters), `ActivityTarget` | **28** |
| 18 | **Email Templates** | Named in nav + one permission | Versioned template library: subject/body, variable palette by entity group, AI rewrite chips, desktop/mobile preview, send test, history/compare/restore, enable/disable. | `EmailTemplate`, `TemplateVersion`, `TemplateVariable`, `EmailBranding` | **29** |
| 19 | **Integrations & Calendar Sync** | Named in nav | Connections hub: calendars (two-way), sourcing boards, email (Gmail/Outlook), meetings (Zoom/Meet), sync direction, health/token expiry, disconnect-keeps-data, accounting export boundary. | `Integration`, `SyncState`, `IntegrationToken`, `AccountingExport` | **30** |
| 20 | **Billing, Plans, Seats & AI Credits** | Named in nav; "Billing CRUD" in the matrix | Plans (Starter/Growth/Agency), annual pricing, seat purchase/removal with proration, invoices, AI credit quota + top-ups, usage meters, trial, cancellation flow with retention window, white-label gating. | `Plan`, `Subscription`, `Seat`, `BillingInvoice`, `AICredit`, `UsageMeter`, `Trial` | **31** |
| 21 | **Security, Sessions, API & Audit Log** | "Security" appears once in a nav list | MFA enforcement, password policy, session timeout, allowed email domains, SSO/SAML, device sessions + revoke, API tokens, security score, login history, full audit log with payloads/export/retention. | `Session`, `ApiToken`, `LoginHistory`, `AuditEvent`, `SecurityPolicy`, `SecurityScore` | **32** |
| 22 | **Onboarding & First-Run** | **Never mentioned** | 5-step Get Started checklist with persisted progress, sample workspace, and the empty state of every list/board/dashboard. | `OnboardingProgress`, `SampleWorkspace`, `EmptyState` catalogue | **33** |
| 23 | **Import / Export & Duplicate Merge** | Duplicate *rule* only, in 09 | CSV / LinkedIn Recruiter import up to 5,000 rows with column mapping and email-based merge, auto-queued screening; PDF/Excel/Word export on every list. | `ImportJob`, `ColumnMapping`, `DuplicateMatch`, `MergeRecord`, `ExportJob` | **34** |
| 24 | **Search, Filters, Sorting & List Conventions** | **Never mentioned** | Scoped search, multi-select filter chips, draft-then-apply filter popovers, tri-state column sort, sort chips, table/board view toggle persistence, ⌘K palette over candidates/jobs/clients. | `SavedView` (implied), `FilterState`, `SearchIndex` | **35** |
| 25 | **Help Center & Support** | **Never mentioned** | Searchable KB with 6 categories, plan-tiered support SLA (Pro = 4 business hours), message-support escalation. | `Article`, `ArticleCategory`, `SupportTicket`, `SupportSLA` | **36** |
| 26 | **Preview-as-role (impersonation)** | **Never mentioned** | Admin previews the app as a named user/role, with a banner and Exit preview; changes the entire nav and data scope. | `ImpersonationSession` | fold into **32** |

---

# 2. MISSING ENTITIES / DATA

Fields below are those the designs literally show. None of these entities exist in the doc's data model except where noted.

**Submission** (the single largest omission)
`id`, `candidate`, `job`, `client`, `clientContact` (recipient), `submittedBy` (lead), `submittedAt`, `emailTemplate` (Standard submission / Executive brief / Quick intro), `subject`, `attachments[]` (formatted profile PDF, original CV), `hideContactDetails` (anonymise until approval), `includeAIMatchSummary`, `showSalaryExpectation`, `recommendationNote` ("why we recommend them"), `noteForClient`, `aiScoreSnapshot`, `slaHours` (48h internal / 3 business days client-facing), `elapsed`, `remindersSent[]`, `decision`, `decisionAt`, `decisionReason`, `decisionBy`, `portalViewedAt`.

**ClientDecision** — `submission`, `value` (Selected/Approved · Rejected/Declined · Hold for now · Need another profile), `message` (shared with team), `decidedBy` (client contact), `decidedAt`, `resultingInterview`.

**Interview** — `name/type` (Internal screen, Client L1, Client L2, Technical round, Final/HR), `round`, `roundType` (internal | client), `candidate`, `job`, `client`, `start`, `end`, `duration` (computed), `mode` (Video/On-site/Phone), `meetingLink` (auto-created) | `location` | `phone`, `interviewers[]`, `panelType` (internal | client panel), `owner` (≠ creator), `assessmentTemplate`, `briefingFile`, `scheduleComments` (interviewer-visible, candidate-hidden), `reminderOffset` (none/15m/30m/1h/1d), `emailInvitesOnSave`, `attachAIBrief`, `status` (Pending/Confirmed/Cancelled), `timezone`, `selfScheduleLink`, `calendarEventId`.

**AvailabilitySlot** — `member`, `start`, `end`, `busy`; plus derived `conflict` per candidate slot and a "find a free slot" search.

**Scorecard / AssessmentTemplate** — template: `name`, `version` ("Backend Engineering Scorecard v3"), `criteria[]`; scorecard: `interview`, `interviewer`, `scores{Technical depth, Communication, Culture & motivation}` 1–5, `verdict` (Advance/Hold/Reject), `notes`, `dueAt`, `overdue`, `submittedAt`, `aggregateScore` (e.g. 8.5/10).

**Offer** — `candidate`, `job`, `client`, `ctc`, `feePercent`, `feeAmount` (computed), `sentAt`, `expiresAt`, `status` (Sent/Negotiating/Accepted/Declined/Withdrawn), `joinDate`, `offerLetterPdf`, `emailTemplate` ("Offer letter"), `validityDays` (7).

**Placement** — `offer`, `candidate`, `job`, `client`, `joinDate`, `fee`, `feeBasis`, `guaranteeDays` (90), `guaranteeEndsAt`, `guaranteeStatus` (active/ended), `invoice`, `commissionLines[]`, `timeToFill`.

**Invoice** — `number` (`INV-2026-021` / `INV-0141`), `client`, `placement`, `amount`, `terms` (Net 15/30/45/60/Custom), `issuedAt`, `dueAt`, `paidAt`, `status` (— / Invoiced / Paid / Overdue + days), `billingEmail[]`, `taxId/GSTIN`.

**Commission** — `placement`, `member`, `role` (Sourcer | Profile lead), `ratePercent` (7 / 5), `amount`, `status` (pending/paid), `releasedAt` (gated on invoice paid), `payoutRun`.
**PayoutRun** — `period`, `placements[]`, `total`, `scheduledAt`, `status`.

**SourcingActivity / InviteLog** — `member`, `candidate/profileUrl`, `job`, `client`, `type` (invite sent, connection accepted, JD shared, CV received, submitted, client approved), `provenance` (extension auto-log | manual "+ Log" | API), `occurredAt`, `countsTowardTarget`.
**DailyInviteTarget** — `member` or `assignment`, `target` (50 in one screen, 30 in another, 40 per role — **needs one rule**), `period`, `streak`.

**Assignment (role ↔ staff)** — `job`, `client`, `employee/sourcer`, `profileLead`, `assignedAt`, `assignedBy`, `dailyTarget`, counters `{invites, connected, jdShared, cvs, submitted, approved}` windowed 30d. This join entity is what makes lead-scoped data visibility computable and is entirely absent from the doc.

**ScreeningRun / Result** — `candidate`, `job`, `score` 0–100, `verdict` (Strong ≥ threshold / Consider 60–79 / Below bar < 60), `scoredAt`, `weights` (skills 40% · experience 30% · domain 20% · comp 10%), `dimensionScores{JD skill match, Experience depth, Domain fit, Comp alignment}`, `mustHaveChecklist[]` (requirement → met/unmet), `strengths[]`, `watchOuts[]`, `adjacentEvidence`, `version`, `triggeredBy` (upload | association | manual re-run), `creditsUsed`.
**ScreeningSettings** — `defaultThreshold` (80), `scoreOnUpload`, `autoForwardToLead`, `perRoleOverrides[]`, `dailyQuota` (200).

**Automation** — `title`, `description`, `category` (AI/Candidates/Clients/Interviews/Email), `isAI`, `status` (Enabled/Paused/Draft), `trigger`, `conditions` (threshold %, delay days, schedule), `action`, `scope` (All roles | specific), `createdBy`, `editedAt`, `runsThisWeek`.
**AutomationRun** — `automation`, `subject` (candidate/client/user), `outcome` (Success/Failed), `at`, `durationMs`, `retryable`.

**Notification** — `kind` (Recruitment/Clients/AI/Team/System), `priority` (Critical/Action required/Info/Completed), `text`, `at`, `unread`, `href`, `actions[]`, `subRows[]`, `snoozedUntil`, `archived`, `mutedPattern`; retention 90 days.
**NotificationPreference** — per kind/channel.

**Conversation / Message** — conversation: `participant` (Candidate | TeamMember), `subjectRefs{candidate, job, client}`, `lastMessageAt`, `unreadCount`, `presence`; message: `direction`, `body`, `sentAt`, `readAt`, `attachments[]`, `templateUsed`.

**PortalShareLink / MagicLinkToken** — `client`, `contact`, `scope` (submissions of that client only), `expiresAt` (13 days link / 15 min token), `deviceBound`, `issuedBy`, `usedAt`.

**ContactActivity** (contact/client feed) — `contact`, `client`, `kind` (Email/Call/Meeting/Feedback/System), `actor` (user | portal | automation | system), `text`, `at`, `dualWrite` to contact timeline + account feed.

**FeeAgreement (on Client)** — `feeBasis` (% of CTC | Flat), `feeValue`, `replacementPeriod` (None/30/60/90/Custom), `paymentTerms`, `billingEmail[]`, `taxId/GSTIN`, `contractFile` (MSA), `effectiveFrom` (changes apply to future roles/invoices only — versioned), `lastEditedBy/At`.

**ImportJob** — `file`, `rowCount`, `columnCount`, `mapping[]`, `duplicatesFound[]`, `mergeStrategy` (merge, not re-add), `importedCount`, `screeningQueued`, `maxRows` 5,000, `sourceFormat` (CSV | LinkedIn Recruiter export).

**AuditEvent** — `at`, `actor` (user | Automation | Client portal | API | Unknown), `category` (Permissions/Candidates/Client actions/Requirements/Billing/System/Security/Integrations/Email), `result` (success/warning/failure), `entity`, `previous`, `new`, `payload` (JSON, copyable), `ip`; retention 12 months, export limit 100,000.

**Session / ApiToken / LoginHistory** — session: `device`, `ip`, `lastSeen`, badges (Current/Trusted/Mobile/New), revoke; token: `name`, `createdBy`, `expiresAt`, `revoked`; login: `result` (Success/Failed/Blocked), lockout after 3 failures for 15 min.

**Plan / Subscription / Seat / AICredit** — plan tier + annual price, seats total/used/available (**pending invites don't consume a seat** — contradicts nothing in the doc because the doc never says), proration on add, scheduled removal next cycle, AI credits used/quota with monthly reset and ₹500/1,000 top-up, usage meters (resume parsing, matches, emails, storage).

**Also missing as first-class objects:** `Pipeline` + `Stage` (with SLA and WIP cap), `StageStatus` (35+ values), `Flag/Tag` (URGENT / VIP CLIENT / REFERRAL / REPLACEMENT), `Source/Channel` with cost-per-hire, `SourcedProfile`, `DuplicateCheck`, `ContactEnrichment` (masked PII + reveal), `Assistant` link on a contact, `ParentCompany` on a client, `SelfScheduleLink`, `WeeklyAIReport`, `ClientReport`, `CalendarConnection`, `MeetingLink`, `Article`, `OnboardingProgress`, `Trial`, `ImpersonationSession`.

---

# 3. GAPS INSIDE EXISTING CHAPTERS

## 01-Introduction-System-Overview
- **Module list is wrong**: omits Sourcing, Submissions, Pipeline, Automation, Notifications, Messages, Commissions, Team Activity, Client Portal, Help Center, Import/Export, Onboarding. Lists 16 modules where the designed nav implies ~26.
- **Navigation doesn't match the designed IA**. Designs: MAIN (Dashboard) · RECRUITMENT (Clients, Contacts, Jobs, Candidates, Interviews, Placements) · INSIGHTS (Analytics, **Commissions**, **Team Activity**) · AI (**AI Screening**, **Automation**) · TOOLS (Settings, Integrations, Help Center). Doc has a flat list with no groups, no Commissions, no Team Activity, no Automation.
- **Nav is role-scoped in the designs and the doc never says so**: sourcer sees Dashboard/My Jobs/Candidates/Analytics/Commissions/AI Screening/Integrations/Help; lead additionally sees Interviews; neither sees Clients/Contacts/Placements/Settings/Team Activity.
- **Missing "My Jobs"** as a distinct nav item for sourcers.
- **End-to-End Workflow omits the entire sourcing half** (invite → connect → share JD → receive CV) and the entire money tail (invoice, commission, guarantee).
- **Core Relationships missing**: Job → 2 assignees (sourcer + profile lead); Submission as the Candidate×Job×Client join; Client → FeeAgreement → Invoice → Commission; Member → client-access list; Assignment as the scoping entity.
- No mention of the **two parallel funnels** (sourcing funnel vs pipeline funnel) that Analytics stitches together.
- No **glossary** reconciling Job/Requirement/Role, Member/Employee/Sourcer, Submission/Association.

## 02-User-Roles-Permissions
- **Role set is wrong.** Doc: Owner / Profile Lead / Recruiter / Viewer. Designs show: `Owner`, `Admin`, `Recruiter`, `Team Lead`, `Sourcer`, `Profile Lead`, `Hiring Manager`, `Finance` as assignable, with system roles Owner/Profile Lead/Recruiter locked and **custom roles supported today** (Sourcer is a shipped custom role). "Viewer" appears nowhere in the designs.
- **Custom roles**: doc says "future versions"; the designs ship Duplicate/Create role, "Based on", and per-permission toggles on custom roles only.
- Missing: **Admin** tier, **Finance** persona (invoices/payouts), **Hiring Manager**, **client contact** as an external role type.
- Missing the **third scoping dimension**: role × client-access list × **assignment** (lead sees only employees on their roles). Designs state it explicitly: "Lead view — showing only employees working on Ana Novak's roles".
- Missing: promotion to Owner/Admin requires confirmation; Owner client access can't be narrowed; ownership transfer is out-of-band ("contact support").
- Missing: **preview-as-role/impersonation**, with banner and Exit preview.
- Permission matrix omits all new modules (Submissions, Pipeline, Sourcing, Automation, Commissions, Team Activity, Notifications, Messages, Integrations, Audit, Portal).
- Missing account lockout, magic-link/portal auth as a separate identity system.

## 03-Workspace
- Missing fields shown in Settings → Workspace: **office address**, **phone with country code**, **default language**, **date format** (4 options), **time format** (12/24h), **first day of week**, **default job visibility**, **white-label reports toggle** (plan-gated: "Hide 'Powered by HirePilotX'"), **report accent colour**, **default placement fee 8.33% on annual CTC**, **default notice period as an enum** (15/30/60/90).
- **Resume Privacy is an enum**, not a boolean: `Never mask · Mask until shortlisted · Mask until interview · Mask until placement · Always mask`, masking name/email/phone/LinkedIn/resume attachment. Doc says only "default Internal".
- **Candidate Owner Strategy enum missing**: `Round-robin (auto) · Creator · Team Lead (auto) · Manual · named person`.
- **Duplicate-detection configuration missing entirely**: selectable identifiers `Email · Phone · LinkedIn · Resume hash · PAN/National ID`, "flagged when **any** selected identifier matches".
- Email branding missing **BCC archive address** and the Mailjet delivery note.
- ID prefix formats differ: doc `CLI-00001`; designs `CLI-000102`, `CAN-000123`, `JOB-000045`, `INV-2026-0007`, `CON-000318`. Digit width and invoice year-segment undefined.
- Business hours: designs add "interview slots & reminders respect these hours" and working-days config; doc lacks the downstream binding.
- Missing: **per-user overrides** of language/date/time in Account settings, and the fact that a separate Profile Settings screen exists.
- Missing: currency options (₹ INR / $ USD / € EUR / د.إ AED) and the fact that **fiscal year is Apr–Mar**.

## 04-Members
- Missing: **seats are not consumed by pending invites**; "Purchase another seat" with proration; "Remove seats" scheduled for next billing cycle.
- Missing invite mechanics: **multi-email textarea (one per line)**, client access = `All clients | Unassigned | specific list`, invite link **expires in 7 days**, Resend/Cancel per pending invite with undo, **workspace join link** (`/join/agency-x7k2m9`).
- Missing member row actions: `View profile`, **`Reset password`**, `Suspend`/`Activate`, inline role change with confirmation for Owner/Admin.
- **Status enum mismatch**: doc `Pending/Active/Disabled/Removed`; designs `Active/Invited/Suspended/Disabled`.
- Missing list mechanics: search, filter by role/status, sort by member/role/status/last active.
- Missing: MFA coverage metric ("4 of 9 haven't yet"), "Remind them" action, inactive-30-days review.
- Missing: **reassigning candidates when a member leaves** (named as a Help Center article and implied by "team unassigned" on role delete).
- Missing: per-member **daily invite target** and role assignment counters.

## 05-Roles-Permissions-Configuration
- The permission vocabulary is a different, smaller set than the designs'. Designs group **12 permissions** as: *Recruiting* — Send LinkedIn invites & share JD · Upload & manage received CVs · Run AI screening · Review CVs & submit to client · Call candidates & schedule interviews · Export candidates · Delete candidates; *Jobs & clients* — Manage roles/jobs · Manage clients & contracts · View dashboard & reports; *Workspace* — Invite & manage team members · Configure automation & integrations. None of the sourcing/review/screening/automation grants exist in the doc.
- Missing tab-level permission keys the designs use: `workspace.manage`, `members.view`, `roles.manage`, `templates.manage`, `integrations.manage`, `integrations.readonly`, `billing.view`, `security.view`, `audit.view` — including the **read-only variant** that renders a "Read-only" badge, and the rule that **tabs disappear entirely** without the permission.
- Missing: system roles are **locked templates**; Duplicate to customise; "Based on" when creating; Delete custom role.
- Missing design-stated rationale: "Export candidates — often restricted for junior recruiters"; "Delete candidates — kept separate from edit rights".
- No permissions defined for: Submissions, Pipeline moves, Sourcing/extension, Automation, Commissions (Run payout / Mark paid = Finance), Team Activity scope, Notifications, Messages, Portal sharing, Audit export, Impersonation, Contact enrichment / PII reveal.

## 06-Clients
- Missing fields from Edit Client: **Parent company** (createable inline), **Company Code**→ID mismatch, **LinkedIn company**, **Career page**, **Timezone**, **Annual hiring volume** (10–20/20–50/50–100/100+), **Recruiter notes**, **Billing address + Office address** with "Use billing address", **Client contract (MSA)** and additional documents (PDF/DOCX/PNG/JPG, 25 MB), **Account manager**, **Source**, **Billing email (multi-recipient)**, **Tax ID/GSTIN**.
- **Status enum mismatch**: doc `Active/Prospect/Inactive/Archived`; designs `Prospect/Active/Paused/Inactive/Blacklisted` + rule "Prospects don't count toward active-client reporting".
- **Fee agreement is missing entirely** as a structured object: fee basis (% of CTC | Flat), value with 0.1–100 validation, replacement period enum, payment terms enum, live fee preview (`20% of ₹18L ≈ ₹3.6L`), and the versioning rule "applies to future requirements & invoices; **existing invoices unchanged**".
- Missing **Client Detail screen** entirely — the doc has no detail/dashboard spec: KPI row (Open jobs, Active candidates, Placements + avg time, Revenue FY + outstanding), tabs Requirements/Interviews/Placements/Invoices, submissions-awaiting-feedback hero with SLA, contacts rail, activity feed with All/Recruitment/Billing/AI filters, agreement card, Weekly AI Report, **Share portal**.
- Missing actions: **Duplicate client** (creates draft), **Export client (CSV + JSON)**, soft-delete with "Requirements moved: 2, Recoverable for 30 days".
- Missing **duplicate-client soft warning** ("Similar client exists — created by Ana Novak. You can still save.").
- Missing metrics: client health chip computed from feedback SLAs + open invoices + job activity; fill rate by client; fees by client.

## 07-Client-Contacts
- Missing fields: **Salutation**, **Alternate email** (must differ from primary), **Direct phone** vs **Mobile** (both with country codes), **Personal website**, **GitHub**, **X handle**, **Attachments with a category** (NDA / Org chart / Business card / Other, driving filename prefixes), **Assistant** link to another contact, **Timezone**, **Contact owner**, **Source** (`Manual · Outlook sync · Gmail sync · LinkedIn · CSV import · API · Candidate referral`), **Preferred communication** as an enum (`Email · Mobile · WhatsApp · LinkedIn · Teams`), Department as createable list.
- **Reachability rule missing**: "Enter at least one contact method (Email, Mobile or Direct phone)" — doc requires Work Email outright.
- Missing duplicate detection: by full name, by email-within-client, by **last-10-digit mobile match**, by LinkedIn URL — all soft warnings with "Open existing →".
- Missing **AI domain inference**: "Looks like Nortech — set as client".
- Missing **quick-create Client inline** from the contact form.
- Missing consequences the designs state: Primary contact "receives submissions **and invoice emails** by default"; Email opt-out excludes from "weekly client reports and bulk emails, direct messages still allowed"; archive hides from **pickers and reports**; delete keeps an **anonymized record**.
- Missing **Contact Detail screen** entirely: KPI row (Open roles, Awaiting her feedback, Interviews she's on, Avg response time), tabs Activity/Roles/Candidates/Meetings/Notes, activity filters, Log activity (Call/Email/Meeting/Note), **AI relationship summary + Ask AI**, reply rate / interactions / relationship health, **Nudge** and per-submission **Send reminder**, "Fast responder" badge, portal-activity events.
- Missing: notes are explicitly **never shared with the client portal**.

## 08-Jobs
- Missing that the screen is called **Requirement Detail** and that "role" is the dominant UI word — vocabulary unreconciled.
- Missing **Sourcing Keywords artifact**: auto-generated title variants, **LinkedIn boolean string**, **Naukri/job-board comma list**, "regenerates when the JD or skills change", Copy actions, "Search on LinkedIn".
- **Assigned Team is under-specified**: designs require **two named duty roles** — `Sourcer · builds the pipeline` and `Profile lead · reviews & submits` — with per-assignment **daily invite target** and per-user counters (24 shortlisted / 5 submitted). Doc has "Recruiter (req), Profile Lead (opt), Daily Sourcing Target (opt)".
- Missing job-level fields: **guarantee period** (90 days, mirroring/overriding the client agreement), **hiring period** (start–end dates driving "Day 45 of 92 · 48 days left"), **department**, **seniority**, **public share link**.
- Missing **Milestones**: Created · Published · First submission · First interview · Offer · Hire, each with dates and a "waiting N days — follow up" state.
- Missing job KPI cards and their computation: Submitted (+awaiting feedback), Interviews (+next), Offers (+waiting days), Hires (vs openings), AI screened `116 of 412`, matched ≥ threshold `38`.
- Missing statuses/actions: `Put on hold`, **Duplicate role → draft**, Delete role with blast-radius copy ("team unassigned; 21 candidates stay in your Candidates list"), Share.
- Missing: **per-role AI threshold override** (85/80/75) as an editable job field — doc has Match Threshold but never links it to the workspace default or override precedence.
- Section 4 "Requirements" still has no fields; designs show `Qualifications ·5` and `Responsibilities ·5` as collapsible structured lists.

## 09-Candidates
- **Stage taxonomy is materially wrong/incomplete.** Doc: 8 stages. Designs contain **three competing vocabularies** and a full sub-status enum:
 - Board columns (Pipeline): `Screening · Submissions · Interview · Offered · Hired · Rejected · Archived`
 - Board columns (Pipeline first-run): `Sourcing · CV Received · Lead Review · Submitted · Interview`
 - Candidates table stage filter: `Sourced · Screened · Shortlisted · Interviewing · Offer · Rejected`
 - Candidate Detail stepper: `Invited → Connected → CV Received → Lead Review → Submitted → Interview → Offered → Hired → Rejected → Archived`
 - Plus **35+ sub-statuses** the doc has none of: Invite sent, Connection accepted, No response, CV received, AI screened, **Junk candidate**, Approved for submission, Changes requested, Submitted to client, Approved by client, Rejected by client, Interview to be scheduled, Interview-Scheduled, Interview in progress, On hold, Rejected hirable, Offer planned/made/accepted/declined/withdrawn, Hired, Joined, **No show**, Converted-Employee, Converted-Temp, Hired by client, Forward-to-Onboarding, Unqualified, Rejected by client, Rejected for interview, Archived.
- Missing **stage SLA and WIP capacity** per stage (Screening 3d/cap 8, Submissions 3d/cap 6, Interview 5d/cap 5, Offered 4d/cap 4; first-run board says CV 2d · Lead review 2d · Client 3d — **conflicting numbers**), plus days-in-stage, oldest-in-column, avg-days.
- Missing **transition mechanics**: every move requires a status choice + optional comment written to the timeline; undo restores prior stage *and* status; side effects (→Interview/Scheduled opens Book Interview; →Hired/Joined records the placement and opens Placements).
- Missing candidate list screen spec entirely: columns (Candidate, Role, Client, AI Match, Experience, Applied, Stage, Actions), search scope selector (All/Name/Role/Client), filter groups (Source, Experience bands 0–2/3–5/6–8/9+, AI match bands 90+/75–89/60–74/<60) with draft-then-apply and a count badge, tri-state column sort, sort chips, **Table/Board toggle persisted**, Export PDF/Excel/Word, **Import CSV / LinkedIn Recruiter export (≤5,000 rows, column mapping, merge duplicates by email, auto-queue screening)**.
- Missing fields: **owner avatar per candidate**, flags/tags (URGENT/VIP CLIENT/REFERRAL/REPLACEMENT), attachment count, comment count, `sourcedBy`, `receivedAt`, `aiScore`, masked-PII state.
- Missing sources enum: `LinkedIn · Referral · Indeed · Careers page` (+ Naukri, Wellfound from the plugin).
- Missing: **junk candidate** disposition, **send back to sourcer** with reason (`Skills gap · Overqualified/comp · Location/visa · Needs better fit · CV incomplete`).
- Resume size conflict: doc 10 MB; designs 20/25 MB elsewhere. Formats differ per surface.

## 10-Candidate-Profile
- **AI Screening Report is under-specified.** Designs show: overall % ring, **stated weights (skills 40 / experience 30 / domain 20 / comp 10)**, four dimension scores, **MATCHED REQUIREMENTS vs MISSING/UNPROVEN checklist**, "Why 94%? — Show reasoning", adjacent-evidence rationale, `scoredAt` freshness, verdict band. Doc lists six section names only.
- Missing **Submit to Client composer**: recipient contact picker (or new contact), template cycle, editable subject, **Hide contact details (anonymise until approval)**, **Include AI match summary**, **Show salary expectation**, attach original CV, Compose/Preview tabs, "logged to the candidate timeline", and the explicit product boundary "**no candidate message is sent from here**".
- Missing **stage stepper with per-stage durations** and the grouped "Move status" picker.
- Missing **skill provenance** ("Detected from: resume · CKA certification · interview R1") and required-skill marking.
- Missing **note visibility ACL** (`Internal` vs `Client-visible`) — doc says only "visible within the workspace".
- Missing **contact masking** behaviour ("Candidate · S.N.", masked until client approves).
- Missing **interview rounds with scores** ("Round 1 — Technical screen · Passed · 8.5/10 by Dev Shah") and outcome actions (`Selected` → offer; `Not selected` → sourcer notified + archived).
- Missing **communication counters** (emails/calls/LinkedIn messages) and cross-client **submission history** with statuses.
- Missing pipeline pager (next/prev candidate), sticky action bar, `Create offer` handoff.

## HirePilotX_ATS_User_Flow
- Registration flow missing: email verification token, trial start (14 days), onboarding checklist handoff, sample workspace.
- Every downstream step (Submit, Interview, Feedback, Offer, Placement) is 2–4 fields where the designs show full screens; these should be promoted to real chapters and this file demoted to a one-page index.

---

# 4. MISSING CROSS-CUTTING CONCERNS

1. **SLA framework** — no chapter defines SLAs, yet the designs run on them: client feedback **48h** (Client/Contact Detail) vs **3 business days** (portal/automation) vs **3 days** (board) — unreconciled; stage SLAs (Screening 3d, Submissions 3d, Interview 5d, Offered 4d) vs first-run board (CV 2d, Lead review 2d, Client 3d); scorecard due after interview; JD-sent-no-CV 3 days; invoice Net 30 ageing; guarantee 90 days. Needs one SLA catalogue with breach behaviour (banner, chip colour, reminder, notification, escalation).
2. **AI as a product layer** — no chapter covers: scoring weights and bands, per-role threshold override precedence, re-run/versioning, AI credits/quota and cost, "Ask AI" grounded assistants, AI relationship summaries, AI JD generation, AI email rewrite chips (Improve/Shorten/Make professional/Rewrite), AI sourcing keyword generation, AI candidate brief for panels, AI recommendations on the board, AI "18 better matches", weekly AI report, drafted JD messages, adjacent-skill evidence. Also missing: what happens when AI is disabled or the quota is exhausted.
3. **Automation engine** — trigger/condition/action model, six shipped recipes, six templates, run log + retry, draft/enabled/paused lifecycle, who can author, impact metrics. Zero coverage.
4. **Notifications & digests** — types, priorities, grouping, inline CTAs, snooze/mute/archive, preferences, 90-day retention, daily digest to leads at 7:30 AM, email vs in-app.
5. **Integrations & calendar sync** — connect/disconnect semantics ("sync paused — data is kept"), two-way vs pull/push, token expiry and reconnect, per-integration health, meeting-link auto-creation, accounting export boundary (Tally/Zoho/Xero from Placements → invoices), marketplace.
6. **Client portal & external identity** — magic-link auth (15-min token, device-bound), invite-gated allowlist, link expiry (13 days), what a client can and cannot see, decision attribution, confidentiality notice, "agency view" cross-link.
7. **Data visibility & masking** — three orthogonal scopes (role, client-access list, assignment) plus resume-privacy masking levels, per-submission anonymisation, contact-enrichment PII reveal (audit point), internal-vs-client-visible notes. The doc covers only role + client access, superficially.
8. **Onboarding & first-run** — 5-step checklist with persisted progress and manual self-attestation, sample workspace, trial countdown, disabled controls in first run (Export greyed), and an **empty-state catalogue** for every list, board column, dashboard widget and queue (the designs author distinct copy for each; the doc has two inconsistent sentences total).
9. **Import / export conventions** — export triplet PDF/Excel/Word on every list and analytics screen, filename conventions (`Analytics_Q2.pdf`, `Commission_Q3.xlsx`), CSV+JSON client export, vCard export, audit export limits, import row cap and merge semantics.
10. **Search, filters, sorting, pagination, bulk actions** — no chapter covers any list mechanic; designs show scoped search, multi-select chips with counts, draft-then-apply popovers, tri-state sort, focus facets, recruiter workload filters, bulk select + bulk move/remind/archive, ⌘K palette across candidates/jobs/clients, keyboard shortcuts (`?`, ⌘S).
11. **Undo / soft-delete / retention** — undo toasts (stage move, invite revoke), soft delete with recovery windows (client 30 days), anonymized retention after contact delete, audit retention 12 months, subscription cancellation data retention 90 days, "activity history cannot be deleted".
12. **Money model end to end** — fee agreement → job guarantee → offer CTC → placement fee → invoice (terms, ageing, reminders) → commission split (7%/5%) → payout release gated on invoice paid → revenue in Analytics. No chapter touches any of it.
13. **Units, currency, calendars, timezones** — designs mix ₹ and $, fiscal Apr–Mar vs calendar quarters, IST display with per-user timezone, business-hours-aware scheduling, date/time format prefs. Needs one canonical model.
14. **Numbering & ID formats** — doc's 5-digit prefixes vs designs' 6-digit and year-segmented invoice numbers.
15. **Audit coverage for new surfaces** — portal decisions, automation runs, API actor, impersonation, PII reveal, permission changes, billing changes. The doc's per-module activity lists cover none of these actor types.
16. **Error, conflict and validation states** — scheduling conflicts, duplicate warnings that still allow save, publish gating, account lockout, quota exhaustion, failed automation runs, expired links, seat exhaustion.
17. **Notification/email deliverability & branding** — from/reply-to/BCC archive, Mailjet, signature, white-label footer gating by plan.

---

# 5. PROPOSED DOC TABLE OF CONTENTS

| # | Chapter | Status | Note |
|---|---|---|---|
| 00 | Glossary, Conventions & Conflict Register | **NEW** | Job/Requirement/Role, Member/Employee/Sourcer, Submission vs Association; ID formats; currency; fiscal calendar; timezone; SLA catalogue; empty/error-state patterns |
| 01 | Introduction & System Overview | **EXTEND** | Correct module list, grouped + role-scoped IA, both funnels, full relationship map |
| 02 | User Roles & Permissions | **EXTEND** | 8 roles + custom roles + external client contact; three scoping dimensions; impersonation |
| 03 | Workspace Settings | **EXTEND** | Masking enum, owner strategy, duplicate identifiers, formats, white-label, defaults |
| 04 | Members, Invitations & Seats | **EXTEND** | Suspend, reset password, seat proration, join link, reassignment on offboarding |
| 05 | Roles & Permissions Configuration | **EXTEND** | 12-permission model, tab permission keys, read-only variant, custom-role lifecycle |
| 06 | Clients | **EXTEND** | + Fee agreement, parent company, contracts, 5-status enum |
| 07 | Client Detail (account cockpit) | **NEW** | KPIs, tabs, feedback SLA hero, activity feed, agreement, portal share, weekly AI report |
| 08 | Client Contacts | **EXTEND** | + Salutation, assistant, categories, reachability rule, duplicate detection, consent flags |
| 09 | Contact Detail (relationship 360) | **NEW** | KPIs, activity log, roles/candidates/meetings tabs, AI summary + Ask AI, nudges |
| 10 | Jobs / Requirements | **EXTEND** | + Sourcing keywords, two duty roles, guarantee, hiring period, milestones, threshold override |
| 11 | Requirement Detail | **NEW** | Funnel KPIs, JD sections, team, timeline, AI screening config, share/duplicate/hold |
| 12 | Candidates (list & record) | **EXTEND** | + Full stage/sub-status taxonomy, list mechanics, flags, owner, masking |
| 13 | Candidate Profile | **EXTEND** | + Weighted AI report, submit composer, rounds, provenance, note ACL, pager |
| 14 | Candidate Pipeline Board | **NEW** | Stages, SLA, WIP caps, move modal, undo, bulk, focus facets, AI recommendations |
| 15 | Sourcing & Outreach | **NEW** | Invites, connections, JD share, nudges, daily targets, provenance |
| 16 | Sourcing Plugin / Browser Extension | **NEW** | Multi-site capture, dedupe, role ranking, PII reveal, auto-log |
| 17 | AI Screening | **NEW** | Weights, thresholds, verdict bands, auto-forward, quota, run log, distribution |
| 18 | CV Review (Lead Queue) | **NEW** | Queue, side-by-side review, must-have checklist, submit vs send-back-with-reason |
| 19 | Submissions & Client Review | **NEW** | Package, masking flags, SLA, reminders, decisions + reasons |
| 20 | Client Portal & Magic-Link Access | **NEW** | External auth, scope, expiry, approve/decline, visibility model |
| 21 | Interviews & Scheduling | **NEW** | Ops hub, scheduling form, availability/conflicts, self-schedule, calendar sync, modes |
| 22 | Interview Feedback & Scorecards | **NEW** | Templates + versions, criteria, verdicts, due/overdue, delivery |
| 23 | Offers | **NEW** | CTC, expiry, letter generation, status machine |
| 24 | Placements, Invoices & Guarantee | **NEW** | Join date, fee, invoice lifecycle, ageing, reminders, 90-day guarantee |
| 25 | Commissions & Payouts | **NEW** | Rate card per role, accrual, invoice-paid gating, payout runs, ledgers |
| 26 | Dashboards (Owner / Lead / Employee) | **NEW** | Three role-scoped homes, widgets, priority queues, first-run empty states |
| 27 | Analytics & Reports | **NEW** | Funnel, fill rate, time-to-fill, source cost-per-hire, client & recruiter tables, client report |
| 28 | Team Activity | **NEW** | Assignment counters, targets, admin vs lead scope, approval rate |
| 29 | Messages / Inbox | **NEW** | Candidate + team threads, attachments, templates, read receipts |
| 30 | Notifications | **NEW** | Types, priorities, CTAs, snooze/mute, preferences, digests |
| 31 | Automation | **NEW** | Recipe model, shipped rules, templates, runs, retry, impact |
| 32 | Email Templates & Branding | **NEW** | Template library, variables, versions, AI rewrite, test send, branding/BCC |
| 33 | Integrations & Calendar Sync | **NEW** | Connectors, sync direction, health, disconnect semantics, accounting boundary |
| 34 | Billing, Plans, Seats & AI Credits | **NEW** | Plans, seats, proration, invoices, credits, usage meters, trial, cancellation |
| 35 | Security, Sessions, API Tokens & Audit Log | **NEW** | MFA, policy, SSO, sessions, tokens, security score, audit schema/retention/export |
| 36 | Onboarding & First-Run Experience | **NEW** | Get Started checklist, sample workspace, trial, empty-state catalogue |
| 37 | Import, Export & Duplicate Merge | **NEW** | CSV/LinkedIn import, mapping, merge, export formats and filenames |
| 38 | Search, Filters, Sorting & List Conventions | **NEW** | Shared list/board grammar, ⌘K, keyboard shortcuts, bulk actions, undo |
| 39 | Help Center & Support | **NEW** | Categories, articles, plan-tiered support SLA, escalation |

**Existing 11 files → 10 EXTEND chapters + 29 NEW chapters.** The four highest-value writes, in order: **19 Submissions & Client Review**, **15 Sourcing & Outreach**, **17 AI Screening**, **14 Pipeline Board** — every other screen depends on their vocabulary, and all four are currently undefined.
