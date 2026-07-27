# Module 07 - Client Contacts

**Version:** 2.0

------------------------------------------------------------------------

# 1. Overview

A Client Contact represents a person working for a Client company, such
as a Hiring Manager, HR Manager, Technical Interviewer, Recruiter, or
Decision Maker.

A Contact **cannot exist without a Client**.

Relationship:

    Workspace
    └── Client
        ├── Contact 1
        ├── Contact 2
        └── Contact N

A Contact is a shared workspace record, not a private one. Every member
who can see the Client can see the Client's Contacts. The contact form
states this to the user: contacts are shared with everyone working on
that Client's roles.

A Contact carries three kinds of information:

1.  **Identity and reachability** — who the person is and how to reach
    them.
2.  **Ownership and provenance** — who in the agency owns the
    relationship and where the record came from.
3.  **Consent and preference** — which channels may be used and which
    communications the person has opted out of.

------------------------------------------------------------------------

# 2. Preconditions

Before creating a Contact:

-   Workspace exists
-   User has Create Contact permission
-   Client exists
-   Client is Active or Prospect

If no Client exists, the user is not blocked. The Client field offers
**Create new client**, which opens the quick-create Client dialog
(Section 12) and selects the new Client on the contact form. The legacy
behaviour of disabling **Add Contact** with the message "Please create a
Client before adding a Contact" is superseded by the quick-create path.

------------------------------------------------------------------------

# 3. Navigation and entry points

There are three entry points, and two different forms.

  ---------------------------------------------------------------------------
  Entry point                Form opened                Client field
  -------------------------- -------------------------- ---------------------
  Contacts → New contact     Quick-add dialog           Required, selectable

  Clients → Client → Contacts Quick-add dialog          Pre-filled, editable
  → Add Contact

  Global action New →        Quick-add dialog           Required, empty
  Contact

  Quick-add dialog → Open    Full contact form          Carried over
  the full form →

  Contacts → row → Edit      Full contact form (edit    Editable
  contact                    mode)
  ---------------------------------------------------------------------------

**Quick-add dialog** captures only: Full name (required), Title, Client,
Email, Phone, Owner. It exists so a contact can be captured mid-task. It
displays the line "Contacts are shared with everyone on the client's
roles. Need address, socials & more? Open the full form →".

**Full contact form** captures everything in Sections 5 to 11. It is used
for both create ("New Contact") and edit ("Edit *contact name*").

Keyboard: `Cmd/Ctrl + S` saves the full form. `Esc` closes the open
dropdown or dialog.

------------------------------------------------------------------------

# 4. Screen sections (full form)

Left column:

1.  Contact information
2.  Social links
3.  Recruiter notes
4.  Attachments

Right column:

5.  Contact settings — Ownership
6.  Contact settings — Communication
7.  Contact settings — Preferences
8.  Record (edit mode only)
9.  Danger zone (edit mode only)

------------------------------------------------------------------------

# 5. Contact information

  ------------------------------------------------------------------------------------------
  Field            Type              Required   Rules/Notes
  ---------------- ----------------- ---------- --------------------------------------------
  Salutation       Enum              No         `none` (display "Title"), `mr` ("Mr."),
                                                `ms` ("Ms."), `mrs` ("Mrs."), `dr` ("Dr."),
                                                `prof` ("Prof."). Prefixes the display name
                                                when set.

  First name       Text              Yes        2–50 characters. Letters, accented letters,
                                                spaces, hyphens, full stops and apostrophes
                                                only. Error when empty: "First name is
                                                required". Error when malformed: "Use 2–50
                                                letters (hyphens, spaces & apostrophes are
                                                fine)".

  Last name        Text              Yes        Same rules and messages as First name.

  Display name     Text              No         Derived as `salutation + first + last` when
                                                not overridden.

  Client           Reference         Yes        Searchable picker over Clients the user can
                                                access. Supports "Add *query* as new client"
                                                and "Create new client" (Section 12). Once
                                                set, the field shows "Open *client* →" and
                                                "Edit". Error: "Client is required".

  Department       Createable list   No         Seed list: Engineering, HR, Finance, Legal,
                                                Marketing, Sales, Operations, IT, Product,
                                                Executive, Procurement. A value typed that
                                                is not in the list offers Create "*value*"
                                                and is added to the workspace list.

  Job title        Text              No         Free text, for example "VP Engineering".

  Email            Email             No*        Primary work email. Must be a valid address.
                                                Unique within the Client — a collision is a
                                                soft warning, not a block (Section 13).

  Alternate email  Email             No         Must be a valid address and **must differ
                                                from the primary email**. Error: "Must be
                                                different from primary email".

  Direct phone     Phone             No*        Country-code selector plus number. Minimum 6
                                                digits. This is the desk or switchboard
                                                line.

  Mobile           Phone             No*        Country-code selector plus number. Minimum 6
                                                digits. Used for WhatsApp and SMS
                                                eligibility.
  ------------------------------------------------------------------------------------------

\* Email, Direct phone and Mobile are each individually optional but are
collectively governed by the reachability rule in Section 13.

**Correction to v1.0.** v1.0 specified First/Last name as 2–100
characters and Work Email and Job Title as mandatory. The designs
specify 2–50 characters, optional Job Title, and reachability in place of
a mandatory email. This chapter follows the designs.

Country codes offered by the phone selector are searchable by country
name, ISO code or dialling code. The picker at minimum covers IN (+91),
US (+1), GB (+44), SG (+65), AE (+971), AU (+61), DE (+49), FR (+33),
JP (+81), CA (+1), NL (+31), ZA (+27).

> **Open question:** the Contacts list filters Department by
> Engineering, People, Technology, Finance and Operations, while the
> contact form seeds Engineering, HR, Finance, Legal, Marketing, Sales,
> Operations, IT, Product, Executive and Procurement. "People"/"HR" and
> "Technology"/"IT" are the same concept under two names. One seed list
> must be chosen.

------------------------------------------------------------------------

# 6. Social links

  ------------------------------------------------------------------------------------
  Field             Type   Required   Rules/Notes
  ----------------- ------ ---------- ------------------------------------------------
  LinkedIn          URL    No         Normalised on blur: protocol, `www.` and any
                                      trailing slash are stripped; a bare handle
                                      becomes `linkedin.com/in/<handle>`. A value
                                      containing a path that does not begin
                                      `linkedin.com/` is rejected with "Enter a
                                      LinkedIn URL (linkedin.com/in/…)".

  Personal website  URL    No         Free text, for example `anakelmendi.com`.

  GitHub            URL    No         Revealed under "More social links". Format
                                      `github.com/handle`.

  X (formerly       Handle No         Revealed under "More social links". A leading
  Twitter)                            `@` is stripped on entry; the field displays a
                                      fixed `@` prefix.
  ------------------------------------------------------------------------------------

GitHub and X are collapsed by default behind a "More social links"
toggle and are labelled optional.

------------------------------------------------------------------------

# 7. Recruiter notes

A single free-text area, up to 5,000 characters, prompting for "Hiring
preferences, communication style, decision makers, interview tips,
availability or other internal notes".

Rules:

1.  Notes are **internal only and are never shared with the client
    portal**. This is stated on the Contact Detail screen.
2.  Notes support internal follow-up reminders and mentions of workspace
    members.
3.  The note written on the contact form is the pinned note; further
    notes are added from the Contact Detail Notes tab and are attributed
    to their author with a date.

------------------------------------------------------------------------

# 8. Attachments

Contacts accept documents such as NDAs, org charts and business cards.

  ---------------------------------------------------------------------------------
  Field       Type   Required   Rules/Notes
  ----------- ------ ---------- ---------------------------------------------------
  Category    Enum   Yes        `nda` ("NDA"), `org_chart` ("Org chart"),
                                `business_card` ("Business card"), `other`
                                ("Other"). Defaults to `nda`.

  File        File   No         Accepted formats: PDF, DOCX, XLSX, PNG, JPG.
                                Maximum 25 MB per file. Browse or drag and drop.
  ---------------------------------------------------------------------------------

Rules:

1.  The selected category drives the stored filename prefix:
    `NDA_`, `OrgChart_`, `BusinessCard_`, `Doc_`, followed by the
    contact's last name.
2.  Upload shows live progress and a completion state; a file may be
    removed before or after upload completes.
3.  Attachments are visible to the account team only. They are never
    exposed through the client portal.

> **Open question:** whether more than one attachment per contact is
> supported. The designs show a single "Additional documents" slot; the
> category concept implies a list.

------------------------------------------------------------------------

# 9. Contact settings — Ownership

  ------------------------------------------------------------------------------------
  Field    Type       Required   Rules/Notes
  -------- ---------- ---------- ----------------------------------------------------
  Contact  Reference  Yes        A workspace member. Searchable picker, defaults to
  owner    (Member)              the current user. Shown as an avatar plus name
                                 throughout the product. Changeable from the Contact
                                 Detail rail and by bulk action on the Contacts list.

  Source   Enum       Yes        `manual` ("Manual"), `outlook_sync` ("Outlook
                                 sync"), `gmail_sync` ("Gmail sync"), `linkedin`
                                 ("LinkedIn"), `csv_import` ("CSV import"), `api`
                                 ("API"), `candidate_referral` ("Candidate
                                 referral"). Defaults to `manual` on the form and is
                                 set automatically by the creating integration
                                 otherwise.
  ------------------------------------------------------------------------------------

Rules:

1.  The owner is the accountable relationship holder. Response-time and
    reply-rate metrics on Contact Detail are attributed to the owner's
    team, not to the owner personally.
2.  Source is recorded once at creation and displayed on Contact Detail
    ("Added Mar 12, 2026 · LinkedIn"). Editing a contact does not change
    its source.

------------------------------------------------------------------------

# 10. Contact settings — Communication

  ------------------------------------------------------------------------------------------
  Field           Type              Required   Rules/Notes
  --------------- ----------------- ---------- -------------------------------------------
  Preferred       Enum              Yes        `email` ("Email"), `mobile` ("Mobile"),
  communication                                `whatsapp` ("WhatsApp"), `linkedin`
                                               ("LinkedIn"), `teams` ("Teams").

  Timezone        Enum (IANA)       No         For example `Asia/Kolkata` displayed as
                                               "Asia/Kolkata (IST)". Defaults to the
                                               current user's detected timezone.

  Assistant       Reference /       No         Links to another person who screens or
                  Text                         schedules for this contact. Suggestions are
                                               limited to contacts at the same Client when
                                               a Client is selected. A typed name that
                                               matches nobody may be kept as free text.
  ------------------------------------------------------------------------------------------

**Preferred communication availability rule.** An option may only be
selected when the contact detail it depends on has been entered:

  Option        Requires
  ------------- ---------------------------
  Email         A valid Email
  Mobile        A valid Mobile
  WhatsApp      A valid Mobile
  LinkedIn      A LinkedIn URL
  Teams         A valid Email

Unavailable options are shown disabled with the suffix "— add details
first".

**Default rule.** Until the user changes it, Preferred communication
resolves to `email` when a valid Email exists, otherwise `mobile` when a
valid Mobile exists. Once the user picks a value, that value sticks.

Timezone is used to display the contact's local time on Contact Detail
and to schedule meetings inside their working hours.

------------------------------------------------------------------------

# 11. Contact settings — Preferences

  --------------------------------------------------------------------------------
  Field       Type      Required   Rules/Notes
  ----------- --------- ---------- -----------------------------------------------
  Primary     Boolean   No         Only one Primary Contact per Client. Setting it
  client                           on one contact clears it on the previous
  contact                          holder.

  Email       Boolean   No         Consent flag. Defaults to false.
  opt-out

  Phone       Boolean   No         Consent flag. Defaults to false.
  opt-out
  --------------------------------------------------------------------------------

**Consequences of Primary client contact = true:**

1.  The contact receives candidate submissions by default.
2.  The contact receives **invoice emails and invoice notifications** by
    default.
3.  The contact receives client status updates and the weekly client
    report.
4.  Any other contact may still be selected manually during a
    submission — Primary is a default, not a restriction.

**Consequences of Email opt-out = true:**

1.  The contact is excluded from the weekly client report.
2.  The contact is excluded from bulk emails and marketing-style sends.
3.  Direct, person-to-person emails are still allowed.

**Consequences of Phone opt-out = true:**

1.  The contact is excluded from call and SMS/WhatsApp campaigns and
    from automated call reminders.
2.  Direct calls initiated by a member are still allowed, and the flag is
    surfaced next to the phone number as a warning.

> **Open question:** whether Email opt-out should also suppress
> automated submission and interview notifications, or only reports and
> bulk sends. The designs state only reports and bulk emails.

------------------------------------------------------------------------

# 12. Client selection and inline client creation

The Client picker is searchable. When the typed query matches no
existing Client, the picker offers **Add "*query*" as new client**, and
the footer always offers **Create new client**.

Both open the quick-create Client dialog:

  --------------------------------------------------------------------
  Field          Type    Required   Rules/Notes
  -------------- ------- ---------- ---------------------------------
  Client name    Text    Yes        Error: "Client name is required".

  Website        URL     No         For example `acme.com`.

  Industry       Text    No         For example "Technology".

  Direct phone   Phone   No         Free text with country code.
  --------------------------------------------------------------------

Rules:

1.  Creating a Client from here keeps the user on the contact form and
    selects the new Client immediately.
2.  The new Client is created in an incomplete state; the user is told to
    "finish billing & contract from the Clients screen".
3.  The dialog links to the full Client form for billing, address and fee
    terms.

**AI domain inference.** When no Client has been selected and the typed
Email domain matches a known Client, the form offers a one-click
suggestion: "Looks like *Client* — set as client". Accepting it sets the
Client field. The suggestion disappears once a Client is selected.

------------------------------------------------------------------------

# 13. Reachability and duplicate detection

## 13.1 Reachability rule

A Contact must have at least one usable channel.

> A Contact cannot be saved unless at least one of **Email**, **Mobile**
> or **Direct phone** is present and valid.

Error message: "Enter at least one contact method (Email, Mobile or
Direct phone)."

This replaces the v1.0 rule that Work Email was mandatory.

## 13.2 Duplicate detection

All duplicate checks are **soft warnings**. The record can still be
saved; the warning offers a link to the existing record.

  -------------------------------------------------------------------------------------------
  Check          Match rule                     Message
  -------------- ------------------------------ ---------------------------------------------
  Full name      First name + last name match   "Possible duplicate — *Name* · *Client* ·
                 an existing contact,           *Job title* · Use existing contact →"
                 case-insensitive, across all
                 Clients

  Email          Exact email match within the   "Email already exists for this client —
                 same Client                    *Name* · *Client*. You can still save."

  Mobile         The last 10 digits of the      "Contact with this mobile exists — *Name* ·
                 entered mobile match the last  *Client* · Open existing →"
                 10 digits of an existing
                 contact's mobile. Evaluated
                 only once at least 7 digits
                 have been entered.

  LinkedIn       Normalised LinkedIn URL is     "This LinkedIn belongs to *Name* · *Client* ·
                 identical to an existing       Open existing →"
                 contact's
  -------------------------------------------------------------------------------------------

> **Open question:** the mobile and LinkedIn checks are described as
> global across the workspace, while the email check is scoped to the
> Client. Whether email duplication across different Clients should also
> warn is unresolved; the same person legitimately appears at two
> Clients after a job move.

------------------------------------------------------------------------

# 14. Contact status

  ---------------------------------------------------------------------------------
  Machine value   Display label   Meaning
  --------------- --------------- -------------------------------------------------
  `active`        Active          Normal, reachable contact. Default on creation.

  `vacation`      Vacation        Temporarily unavailable. Feedback SLAs against
                                  this contact are suspended.

  `inactive`      Inactive        Still employed but no longer engaged on
                                  recruitment.

  `left_company`  Left company    No longer at the Client. Setting this status
                                  clears the Primary flag.
  ---------------------------------------------------------------------------------

Rules:

1.  Status is displayed as a chip on the Contacts list and Contact
    Detail. `active` is the implicit default and is not chipped in the
    list.
2.  `left_company` and `vacation` may record a "since" date, displayed as
    "Since Apr 2026".
3.  A contact with status `left_company` cannot be set as Primary and is
    excluded from submission recipient pickers.
4.  Status is separate from archive. Archive is a visibility action
    (Section 17), status is a statement about the person.

**Correction to v1.0.** v1.0 defined only Active/Inactive.

------------------------------------------------------------------------

# 15. Saving

  --------------------------------------------------------------------------------
  Action              Behaviour
  ------------------- ------------------------------------------------------------
  Save contact        Validates, saves, confirms "Contact created — *Name* ·
                      *Client*", returns to the Contacts list.

  Save & add another  Validates, saves, clears the form but **retains** Contact
                      owner, Source, Preferred communication and Timezone as
                      defaults for the next record.

  Save changes (edit) Validates and saves in place. An "Unsaved changes" indicator
                      is shown while the form is dirty.

  Cancel              If the form is dirty, asks to confirm: create mode "Discard
                      this contact? Your unsaved details will be lost."; edit mode
                      "Discard changes? Your edits to *Name* will be lost — the
                      contact itself stays."
  --------------------------------------------------------------------------------

The save control is de-emphasised until First name, Last name, Client
and one contact method are valid, with the hint "Add name, client & one
contact method first". Attempting to save an invalid form highlights
every failing field, scrolls to the first error and shows "Almost there
— Fix the highlighted fields to save".

------------------------------------------------------------------------

# 16. Contacts list screen

Purpose line: "Everyone you talk to at your clients — hiring managers,
HR and finance."

## 16.1 Columns

  -----------------------------------------------------------------------------
  Column       Content
  ------------ ----------------------------------------------------------------
  Contact      Avatar with initials, name, "PRIMARY" badge when primary, status
               chip when status is not `active`, and a second line of "Job title
               • Department".

  Client       Client name. Clicking it filters the list to that Client.

  Email        Address with a copy action.

  Phone        Number with a copy action.

  Last touch   Relative time of the most recent interaction plus the event that
               produced it. Sortable.

  Owner        Owner avatar. Clicking it filters the list to that owner.

  Actions      LinkedIn, Send email, Call, and a kebab menu.
  -----------------------------------------------------------------------------

## 16.2 Last touch semantics

1.  When there has been no interaction, the cell reads "Never" with the
    sub-line "No interactions yet" and is flagged as a warning.
2.  When the most recent event was a bounce, the event line is flagged as
    a warning ("Email bounced").
3.  Event kinds observed: Email sent, Email bounced, Interview feedback,
    Phone call, Submission sent, Auto-reply.
4.  Sorting Last touch is tri-state: unsorted → stale first → most recent
    first.

## 16.3 Search and filters

-   Search matches name, job title, department, email, phone and client.
-   Filter chips, each multi-select and each showing its selected count:
    **Client**, **Owner**, **Department**, **Status**.
-   The Status filter offers `primary` ("Primary") alongside the four
    status values, so "Primary" is filterable as though it were a status.
-   **Clear filters** resets the search and all four chips.
-   Empty result state: "No contacts found — Try another search or clear
    the filters", offering Clear filters and New contact.

## 16.4 Row actions

  Action              Behaviour
  ------------------- ------------------------------------------------------
  View contact        Opens Contact Detail.
  Edit contact        Opens the quick-add dialog in edit mode.
  Send email          Opens a compose window addressed to the contact.
  Set as primary      Makes this contact primary for its Client and clears
                      the previous holder. Confirmation: "*Name* now
                      receives submissions & reports for *Client*".
  Archive contact     Opens the archive confirmation (Section 17).

Clicking a row's activity affordance opens an activity peek panel showing
the contact's recent timeline and a link to the full Contact Detail page.

## 16.5 Bulk actions

Rows are selectable individually or by page. With a selection active:

  Action           Behaviour
  ---------------- --------------------------------------------------------
  Email            Opens a compose window for all selected contacts.
  Assign owner     Reassigns ownership of the selected contacts.
  Export           Exports the selected contacts.
  Change status    Sets `active`, `vacation`, `inactive` or `left_company`
                   on all selected contacts. Setting `left_company` clears
                   the Primary flag on each affected contact.

## 16.6 Pagination and export

-   The list pages at 8 rows per page with the range label "Showing 1–8
    of *N* contacts".
-   Export offers PDF (.pdf), Excel (.xlsx) and Word (.docx).
-   Archived contacts are excluded from the list, from pickers and from
    reports.

------------------------------------------------------------------------

# 17. Archive and delete

  ---------------------------------------------------------------------------------
  Action    Effect
  --------- -----------------------------------------------------------------------
  Archive   The contact is hidden from lists, pickers and reports. They remain on
            past emails, submissions and the audit log. The Primary flag is
            cleared. The contact can be restored. Confirmation copy: "They stay on
            past emails, submissions and the audit log — just hidden from lists and
            role pickers. You can restore them later."

  Delete    The contact is removed from the Client and from every picker. Logged
            activity and past submissions **keep an anonymized record**. The action
            cannot be undone. The confirmation dialog steers the user towards
            Archive when the reason is "left the company or on leave".
  ---------------------------------------------------------------------------------

Delete does not remove historical emails, submissions, interviews or
invoices; those records retain an anonymized reference to the deleted
contact.

------------------------------------------------------------------------

# 18. Contact Detail screen

The Contact Detail screen is the relationship record for a single
contact. It is reached from the Contacts list, from a Client's contact
rail, and from anywhere the contact's name is rendered as a link.

## 18.1 Header

-   Avatar, full name, "PRIMARY" badge when primary, status chip.
-   A **Fast responder** badge when the contact's average response time
    is materially better than the workspace median.
-   Sub-line: "Job title · Department · *Client* → · Contact since *month
    year* · Owner: *owner*". The Client is a link to Client Detail.
-   Primary actions: **Email**, **Log activity**, **Schedule meeting**,
    **Edit contact**.
-   Overflow menu: **Export vCard**, **Copy profile link**, **Archive
    contact**, **Delete contact**.

## 18.2 AI relationship summary

A generated prose summary of how to work with this contact — preferred
channel, responsiveness pattern, what they weight in candidates,
approval history, and when their feedback tends to slip.

Rules:

1.  The summary states its provenance and freshness, for example
    "Generated from 34 email threads, 8 calls & portal activity · updated
    2h ago".
2.  **Regenerate** re-reads the contact's history and restamps the
    freshness label.
3.  **Ask AI** opens a grounded assistant scoped to this contact's
    history, with suggested prompts: "What should I say to *contact*?",
    "Summarize our relationship", "What candidates will *contact* like?",
    "Write a follow-up email", "Prepare for today's meeting". Answers are
    copyable.
4.  The assistant answers only from this contact's emails, calls,
    feedback and portal activity.

## 18.3 Awaiting-feedback hero

Shown while one or more submissions to this contact are unanswered.

-   Title: "*N* submissions waiting on *contact*'s feedback".
-   Each row shows the candidate, AI match percentage, requirement,
    submission age, and elapsed time against the client feedback SLA
    (48h), for example "40 / 48h SLA". Rows past or near the SLA are
    flagged.
-   **Send reminder** per submission; once sent the row shows "reminder
    sent just now".
-   **Nudge *contact*** sends **one digest email covering every waiting
    profile**, not one email per profile.
-   The hero disappears once every waiting submission has been reminded
    or answered.

> **Open question:** the 48h client-feedback SLA on this screen conflicts
> with "3 business days" used by the client portal and automation, and
> with "3 days" on the pipeline board. One SLA catalogue must own this
> number.

## 18.4 KPI row

  ---------------------------------------------------------------------------------
  KPI                 Definition
  ------------------- -------------------------------------------------------------
  Open roles          Count of the Client's open requirements this contact is
                      attached to, with a breakdown of how many as hiring manager.

  Awaiting feedback   Count of submissions sent to this contact with no decision,
                      with the age of the oldest.

  Avg. response time  Median time between a message sent to the contact and their
                      reply, with a comparison against other contacts.
  ---------------------------------------------------------------------------------

## 18.5 Tabs

  ----------------------------------------------------------------------------------
  Tab           Content
  ------------- --------------------------------------------------------------------
  Activity      The full interaction timeline, grouped Today / Yesterday / Earlier.
                Filter chips: All, Emails, Calls, Meetings, Feedback, System. Each
                entry records what happened, when, and the actor (a member name,
                "portal", "automation" or "system"). Empty state: "No *filter*
                activity with *contact* yet."

  Open roles    Requirements the contact is involved in. Columns: Requirement (with
                openings and salary band), Her role, Pipeline count, Submitted
                count, Status. Links to all of the Client's roles.

  Candidates    Candidates in play with this contact. Columns: Candidate,
                Requirement, Stage, AI match, Last update. Links to all of the
                Client's candidates.

  Meetings      Meetings and interviews involving the contact. Columns: Candidate,
                Requirement, When, Panel, Status. Offers "Schedule with *contact*".

  Notes         Recruiter notes with author and date, newest first, plus **Add
                note**. Carries the statement "Notes are internal — never shared
                with the client portal" and a link to edit the pinned note.
  ----------------------------------------------------------------------------------

**Her role** (the contact's role on a requirement):

  Machine value     Display label
  ----------------- -----------------
  `hiring_manager`  Hiring manager
  `interviewer`     Interviewer

**Meeting status:**

  Machine value       Display label
  ------------------- -----------------
  `confirmed`         Confirmed
  `waiting_confirm`   Waiting confirm

## 18.6 Log activity

**Log activity** records an interaction that happened outside the
system.

  ------------------------------------------------------------------------
  Field   Type   Required   Rules/Notes
  ------- ------ ---------- ----------------------------------------------
  Type    Enum   Yes        `call` ("Call"), `email` ("Email"), `meeting`
                            ("Meeting"), `note` ("Note"). Defaults to
                            `call`.

  What    Text   Yes        Free text description. Save is disabled until
  happened?                 non-empty.
  ------------------------------------------------------------------------

Rules:

1.  A logged activity appears in the contact's timeline **and in the
    Client's account feed**.
2.  Logging an activity updates Last touch on the Contacts list.
3.  `note` entries are filtered under Feedback in the activity filters.

> **Open question:** logged Notes appearing under the "Feedback" activity
> filter rather than a "Notes" filter looks unintended.

## 18.7 Right rail

  --------------------------------------------------------------------------------
  Block               Content
  ------------------- ------------------------------------------------------------
  Contact info        Email (copy, compose), Mobile (copy, call), LinkedIn (open),
                      timezone with the contact's **live local time**.

  Preferred channel   The Preferred communication value.

  Relationship        Contact owner with **Change**, Last contact, Relationship
                      health, Avg reply time.

  More details        Contact ID, Source, Added date, Reply rate, Interactions in
                      the last 90 days, Last reply. Collapsed by default.

  Client card         Client name, industry, client since, open jobs, candidate
                      count, submissions waiting feedback. Links to Client Detail.
  --------------------------------------------------------------------------------

**Derived metrics:**

  ---------------------------------------------------------------------------------
  Metric               Definition
  -------------------- ------------------------------------------------------------
  Reply rate           Replies received ÷ messages sent to the contact, over the
                       reporting window.

  Interactions         Count of timeline entries of any kind in the last 90 days.

  Avg reply time       Median time from message sent to reply received.

  Relationship health  A five-point rating derived from reply rate, average reply
                       time and feedback SLA adherence, displayed with a label such
                       as "Strong".

  Fast responder       Badge awarded when average response time is materially
                       better than the workspace median.
  ---------------------------------------------------------------------------------

> **Open question:** the exact band boundaries for Relationship health
> and the threshold for the Fast responder badge are not specified by the
> designs.

## 18.8 Contact identifier

The Contact Detail screen displays a Contact ID in the form
`CON-000318` — a `CON-` prefix and a six-digit zero-padded sequence. The
copyable profile link is of the form
`<workspace-domain>/contacts/CON-000318`.

> **Open question:** other modules in this documentation use five-digit
> identifiers. The identifier width must be reconciled across modules.

------------------------------------------------------------------------

# 19. Business rules

1.  Every Contact belongs to exactly one Client.
2.  One Client can have many Contacts.
3.  A Contact must have at least one of Email, Mobile or Direct phone.
4.  Only one Primary Contact per Client.
5.  A Contact with status `left_company` cannot be Primary.
6.  Archiving a Contact clears its Primary flag.
7.  The Primary Contact receives candidate submissions, status updates,
    the weekly client report and invoice emails by default; any Contact
    may still be chosen per submission.
8.  Email opt-out excludes the Contact from the weekly client report and
    from bulk emails; direct messages are still allowed.
9.  Jobs created for a Client display only that Client's Contacts.
10. Archived Contacts are hidden from lists, pickers and reports but
    remain on historical records.
11. Deleting a Contact keeps an anonymized record on logged activity and
    past submissions.
12. Recruiter notes and attachments are internal and are never exposed
    through the client portal.
13. Duplicate warnings never block a save.
14. Alternate email must differ from the primary email.
15. A Preferred communication channel cannot be selected unless the
    underlying contact detail exists.
16. Contacts are visible to every member who can access the Client.

------------------------------------------------------------------------

# 20. Dependencies

Used by:

-   Clients (contact rail, account feed)
-   Jobs / Requirements (hiring manager, interviewer)
-   Candidate Submissions (recipient, feedback owner)
-   Interviews (panel member, scheduling)
-   Invoices (invoice recipient, via Primary)
-   Email Templates and Automation (recipient resolution)
-   Client Portal (portal identity and activity)
-   Analytics (response time, feedback SLA, client health)

Deleting a Contact does not remove historical emails, submissions,
interviews or invoices.

------------------------------------------------------------------------

# 21. Validation rules

-   Client is mandatory.
-   First name is mandatory, 2–50 characters, letters and
    hyphen/space/apostrophe/full stop only.
-   Last name is mandatory, same rules.
-   At least one of Email, Mobile or Direct phone must be present and
    valid.
-   Email and Alternate email must be valid addresses.
-   Alternate email must differ from the primary email.
-   Phone numbers must contain at least 6 digits after the country code.
-   LinkedIn must resolve to a `linkedin.com/` URL.
-   Attachments must be PDF, DOCX, XLSX, PNG or JPG and at most 25 MB.
-   Only one Primary Contact per Client.
-   Client name is mandatory in the quick-create Client dialog.
-   Duplicate work email within the same Client raises a warning but does
    not block the save.

------------------------------------------------------------------------

# 22. Permissions

  ---------------------------------------------------------------------------
  Action                    Owner   Profile Lead   Recruiter   Viewer
  ------------------------- ------- -------------- ----------- --------------
  View contact                 ✓          ✓             ✓          ✓

  Create contact               ✓          ✓             ✓          ✗

  Edit contact                 ✓          ✓             ✓          ✗

  Set / change primary         ✓          ✓             ✓          ✗

  Change contact owner         ✓          ✓             ✗          ✗

  Change consent flags         ✓          ✓             ✗          ✗
  (opt-outs)

  Log activity                 ✓          ✓             ✓          ✗

  Add / edit notes             ✓          ✓             ✓          ✗

  Upload attachments           ✓          ✓             ✓          ✗

  Bulk actions                 ✓          ✓             ✗          ✗

  Export contacts / vCard      ✓          ✓             ✓          ✗

  Archive contact              ✓          ✓             ✗          ✗

  Delete contact               ✓          ✗             ✗          ✗
  ---------------------------------------------------------------------------

> **Open question:** v1.0 granted Delete to Profile Lead. Given that
> delete is irreversible and leaves anonymized history, this chapter
> restricts it to Owner. This needs confirming against Module 05.

------------------------------------------------------------------------

# 23. Activity log

Capture:

-   Contact created (with source)
-   Contact updated (field-level)
-   Primary Contact changed
-   Contact owner changed
-   Contact status changed
-   Email opt-out or Phone opt-out changed
-   Activity logged (call / email / meeting / note)
-   Note added or edited
-   Attachment added or removed
-   Reminder or nudge sent
-   Contact archived
-   Contact restored
-   Contact deleted
-   Contact exported (vCard or list export)

Each log entry contains: timestamp, actor, action, previous value, new
value. The actor may be a workspace member, `automation`, `portal`,
`system` or an integration.

------------------------------------------------------------------------

# 24. Acceptance criteria

-   A Contact cannot be created without a Client, but a Client can be
    created inline from the contact form.
-   A Contact cannot be saved without First name and Last name.
-   A Contact cannot be saved without at least one of Email, Mobile or
    Direct phone.
-   Alternate email equal to the primary email is rejected.
-   Duplicate name, email-within-client, last-10-digit mobile and
    LinkedIn matches all warn and all still allow the save.
-   Setting a new Primary Contact clears the previous one for that
    Client.
-   The Primary Contact is the default recipient for submissions and
    invoice emails, and can be overridden per submission.
-   A Contact with Email opt-out is excluded from the weekly client
    report and bulk emails, and can still be emailed directly.
-   Setting status `left_company` clears the Primary flag.
-   Archiving hides the Contact from lists, pickers and reports and keeps
    all history; the Contact can be restored.
-   Deleting the Contact leaves an anonymized record on past activity and
    submissions.
-   Preferred communication options are unselectable until the
    underlying detail exists.
-   Attachments are stored with the filename prefix implied by their
    category.
-   Jobs only show Contacts belonging to the selected Client.
-   Contact Detail shows Open roles, Awaiting feedback and Avg response
    time, and lets the user log an activity that lands on both the
    contact timeline and the Client account feed.
-   Recruiter notes are never visible in the client portal.

------------------------------------------------------------------------

# Next Module

Module 08 - Jobs
