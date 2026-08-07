# Client Management — Functional User Flow

The complete end-to-end journey through every screen in the Client Management
module, written from the user's point of view.

**Module contents**

| # | Feature | Screen |
|---|---|---|
| 1 | Clients List | Clients |
| 2 | Add Client | New Client |
| 3 | Quick-create Contact | Create Contact (modal, inside New/Edit Client) |
| 4 | Quick-create Parent Company | (inline in the Parent company picker — no screen) |
| 5 | Client Details | Client Details |
| 6 | Edit Client | Edit Client |
| 7 | Archive Client | Archive Client (confirmation modal) |
| 8 | Export Clients | (toolbar menu — no screen) |
| 9 | Client Workspace | Requirements · Interviews · Placements · Invoices (tabs on Client Details) |
| 10 | Feedback SLA Chase | (hero strip + Submitted CVs list on Client Details) |
| 11 | Client Activity Feed | (rail panel on Client Details) |
| 12 | Access Denied | Permission Denied |

---

## Read this before writing tests

The sample template used to request this document lists example fields and
example alternative flows that do **not** all exist. Documented below is the
real behaviour. The differences that matter to QA:

| Sample rule | Actual behaviour |
|---|---|
| Company Name must be unique | **Not unique.** Two clients may carry the same name; nothing warns or blocks. |
| Website must be a valid URL | **No URL validation.** Free text, 255 characters. `acme.com` and `not a website` are both accepted. |
| Separate "Legal Name", "Tags", "Country", "Currency", "Time Zone" required fields | Legal Name and Tags do **not** exist. Country exists only inside the Billing and Office address blocks (optional free text). Currency is **Billing currency** and Time zone is optional — both live in the form, neither is required. |
| "Tax Number" | Field is **Tax ID / GSTIN**, optional, 40 characters. |
| Import Clients | **Not built.** There is no import on the Clients screen. |
| Sort | **No sort control.** The clients screen is a card grid; it orders newest-first and offers no sort UI. |
| Save Draft | **Not built.** A client is either saved or abandoned. |
| Delete / Restore / Merge | **Only Archive is built**, and it is one-way in the UI. The record is hidden, not destroyed, but there is no Restore, Delete or Merge screen. |
| Email is a client field | The client itself has **no general email**. It has a **Billing email** (a list). Person-level email lives on Contacts. |

Two header actions on Client Details — **Share portal** and **Weekly AI Report**
— are drawn but not yet wired: both return the user to the Clients list. Treat
them as placeholders, not as failing features.

---

# 1. Clients List

## Purpose

The home of the module. It answers the account manager's daily question — which
clients are hiring, which are going quiet, and which need something from me —
and is the launch point for every other client action.

---------------------------------------------------------

## Entry Point

• Main navigation → **Clients**
• Dashboard → any client name or client tile
• Contact Details → **Client** panel → the client's name
• Job / Requirement screens → the client shown on a requirement
• After saving, cancelling or archiving a client (the module always returns here)

---------------------------------------------------------

## Preconditions

• User is signed in
• User's email is verified
• User's role grants access to the **Clients** resource — without it the nav
  entry is not rendered and a direct link lands on Permission Denied
• The workspace exists (the user has completed sign-up); no client records are
  required — the screen has a first-run empty state

---------------------------------------------------------

## User Flow

### Step 1 — Clients

**Screen**
Clients

**Purpose**
See the whole client book at a glance, then narrow it down.

**User sees**

• Four summary tiles across the top:
  – **Active Clients** — the count, with "{n} currently hiring" beside it and
    "+{n} added this quarter" underneath
  – **Active Requirements** — open requirement count, with "Across {n} clients"
  – **Avg Time to Hire** — "{n} days", with "Across placed candidates"
  – **Placements** — the count, with "all time"
• A toolbar: search box, status tabs, Health filter, Filters, Export, Add client
• A grid of client cards, six to a page
• A pager line — "{shown} of {total} clients · page {p} of {n}"

**Each client card shows**

• Company logo (or a coloured initial tile when no logo was uploaded)
• Client name and industry
• Status chip — Prospect · Active · Hiring · Paused · Inactive · Blacklisted
• Health chip — Healthy · Attention · At risk · Dormant
• Open requirements, candidates and placements counts
• Account manager
• A candidate-flow bar split into sourced / screening / interviewing, with the
  in-pipeline total
• Last activity line

**User can**

• Search clients — matches **client name or industry**
• Filter by status — All · Hiring · Paused
• Filter by health — Healthy · Attention · At risk · Dormant
• Clear all filters
• Export the current list as PDF, Excel or Word
• Page through the results
• Open a client
• Add a requirement for a client
• View a client's contacts
• Edit a client
• Archive a client
• Create a new client

**Empty state**
"No clients yet. Add your first client to start sourcing." — shown with the
Add client button still available.

**Next Screen**

• **Add client** → New Client
• **Open client** (or clicking the card) → Client Details
• **Edit client** → Edit Client
• **Add requirement** → Jobs / New Requirement
• **View contacts** → Contacts
• **Archive** → Archive Client confirmation modal

---------------------------------------------------------

## Validations

**Search**

• Optional
• Free text
• Matches client name and industry only — it does not search contacts,
  requirements or notes

**Status filter**

• One value at a time (All, Hiring or Paused)

**Health filter**

• One value at a time; clearing it returns all health states

**Export**

• Requires at least one client on the current page — an export of an empty list
  produces an empty document

---------------------------------------------------------

## Error Scenarios

| Scenario | What the user sees |
|---|---|
| No clients in the workspace | The first-run empty message, with Add client still offered |
| Filters match nothing | The same empty message, with the applied filters still visible so the user can clear them |
| The list fails to load | Card skeletons resolve into the empty state; the toolbar stays usable and a retry is a page refresh |
| User lacks Clients permission | The navigation entry is absent; a direct link lands on Permission Denied |

---------------------------------------------------------

## Success Flow

The filtered set redraws in place. Search, status, health and page are held in
the address bar, so the view survives a refresh and can be shared with a
colleague as a link.

---------------------------------------------------------

## Alternative Flows

| Flow | What happens |
|---|---|
| Archive from the card | Opens the Archive confirmation; on confirm the card disappears from the grid and from the summary tiles |
| Add requirement from the card | Leaves the module for the Requirements screen |
| View contacts from the card | Leaves the module for Contacts |
| Export | Downloads a document of the visible clients; PDF opens a print view |

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Dashboard · Contacts · Requirements · direct link |
| **Current Screen** | Clients |
| **Next Screen** | New Client · Client Details · Edit Client · Requirements · Contacts |

---------------------------------------------------------

## Buttons

| Button | Location | Result |
|---|---|---|
| Add client | Toolbar (primary) | Opens New Client |
| Export | Toolbar | Opens the export menu — PDF (.pdf), Excel (.xlsx), Word (.docx) |
| Filters | Toolbar | Reveals the health filter row |
| Clear all | Toolbar | Resets search, status and health |
| Open client | Card | Opens Client Details |
| Add requirement | Card | Opens the Requirements screen |
| View contacts | Card | Opens Contacts |
| More (⋯) | Card | Opens the card menu — Edit client · Archive |
| Edit client | Card menu | Opens Edit Client |
| Archive | Card menu | Opens the Archive confirmation |
| Page next / previous | Pager | Moves through the grid |

---

# 2. Add Client

## Purpose

Bring a company onto the books in one pass — who they are, where invoices go,
who owns the account, and what the agency gets paid — so that every requirement,
submission and invoice raised later inherits the right defaults.

---------------------------------------------------------

## Entry Point

• Clients → **Add client**
• Clients empty state → **Add client**
• Parent company picker on this same form → "Create '{name}' as parent company"
  (creates a bare client record without leaving the form — see Alternative Flows)

---------------------------------------------------------

## Preconditions

• User is signed in and email-verified
• User's role grants access to the Clients resource
• Nothing else — no contact, industry or account manager needs to exist first;
  each can be created or left blank from here

---------------------------------------------------------

## User Flow

### Step 1 — New Client

**Screen**
New Client — "Add the company, billing details and the contract — roles come
next."

**Purpose**
Capture the client record.

**Layout**
A wide main column beside a sticky side column. On a narrow screen the side
column stacks underneath.

**Main column — Client information**

| Field | Control |
|---|---|
| Company logo | Upload tile (optional) |
| Client name | Text — **required** |
| Parent company | Picker of existing clients, with inline create |
| Main office phone | Phone with country dial code |
| Website | Text |
| Industry | Searchable picker |
| Primary contact | Contact picker, with **Create new contact** |
| LinkedIn company | Text (optional) |
| Career page | Text (optional) |
| Timezone | Searchable picker |
| Company size | 1–50 · 51–200 · 201–1000 · 1000+ |
| Annual hiring volume | 10–20 · 20–50 · 50–100 · 100+ |
| Recruiter notes | Long text |

**Main column — Address**

| Field | Control |
|---|---|
| Shipping same as billing | Checkbox, **on** by default |
| BILLING — Street, City, Province / State, Postal code, Country | Text |
| OFFICE — Street, City, State, Postal code, Country | Text; copied from Billing and locked while the checkbox is on |

**Main column — Attachments**
"MSA/contract, org charts or anything tied to this client"

| Field | Control |
|---|---|
| Client contract (MSA) | File upload |
| Others | File upload |

**Side column — Ownership**
"Who owns this account and where it came from"

| Field | Control |
|---|---|
| Account manager | Teammate picker — **pre-filled with the signed-in user** |
| Source | Added by user · Referral · Inbound enquiry · Outbound · Marketing event |
| Client status | Prospect · Active · Hiring · Paused · Inactive · Blacklisted — **Prospect** by default, with the hint "Prospects don't count toward active-client reporting" |

**Side column — Fee agreement**
"Defaults for every role and invoice under this client"

| Field | Control |
|---|---|
| Fee basis | % of CTC · Flat fee — **% of CTC** by default |
| Fee % of annual CTC | Text — shown only when the basis is % of CTC |
| Flat fee per placement | Text — shown only when the basis is Flat fee |
| Replacement period | None · 30 · 60 · 90 days · Custom — **90 days** by default. "Free replacement if the hire leaves within this period" |
| Contract renews | Date (optional) |
| Payment terms | Net 15 · Net 30 · Net 45 · Net 60 — **Net 30** by default |
| Billing currency | INR · USD · EUR · GBP · AED · SGD · AUD — **INR** by default. "Drives fees, offers, invoices and commissions for this client" |
| Tax treatment | GST (India) · VAT (EU, reverse charge) · US sales tax · None — **GST** by default |
| Off-limits period | Number of months, **12** by default. "Months a placed candidate may not be re-approached" |
| Billing email | One or more addresses; press Enter to add another |
| Tax ID / GSTIN | Text (optional) |

A standing note closes the card: "Invoices go to the billing email — used by
Finance to compute placement fees and invoice amounts."

**User clicks**
**Save client**

**System**

• Creates the client
• Assigns the account manager
• Stores the billing address, and the office address (copied from billing when
  the checkbox is on)
• Stores the fee agreement as the default for every requirement and invoice
  raised under this client
• Attaches the uploaded contract and files
• Counts the client into the Clients summary tiles — unless the status is
  Prospect, which is excluded from active-client reporting
• Confirms with "Client created"

**Next Screen**
Clients

---------------------------------------------------------

## Validations

**Client name**

• Required — "Company name is required"
• Maximum 150 characters — "Keep the company name under 150 characters"
• **Not** checked for uniqueness

**Parent company**

• Optional
• Chosen from existing clients, or typed and created inline
• Maximum 150 characters

**Main office phone**

• Optional
• Must be a valid number for the selected country dial code — "Enter a valid
  phone number for the selected country"

**Website**

• Optional
• Maximum 255 characters
• Not validated as a URL

**Industry**

• Optional
• Must be picked from the industry list; free text is not stored

**Primary contact**

• Optional
• Must be an existing contact, or one created from the picker

**LinkedIn company / Career page**

• Optional
• Maximum 255 characters each
• Not validated as URLs

**Timezone**

• Optional
• Must be picked from the timezone list

**Company size / Annual hiring volume**

• Must be one of the listed bands; both are pre-selected, so neither can be left
  empty

**Recruiter notes**

• Optional
• Maximum 5000 characters — "Keep the notes under 5000 characters"

**Company logo**

• Optional
• PNG, JPEG, WEBP or SVG
• Maximum 2 MB
• Guidance: "PNG or SVG, 512×512 — shows on client cards, reports & email
  branding"

**Client contract (MSA) / Others**

• Optional
• PDF, DOC, DOCX, XLS, XLSX, JPEG or PNG
• Maximum 20 MB per file
• Multiple files allowed on each

**Address fields (Billing and Office)**

• All optional, free text
• While "Shipping same as billing" is on, the Office block mirrors Billing and
  cannot be typed into

**Account manager**

• Must be a teammate in the workspace
• Defaults to the signed-in user

**Source / Client status / Fee basis / Payment terms / Billing currency / Tax treatment**

• Must be one of the listed options; each is pre-selected

**Fee % of annual CTC / Flat fee per placement**

• Optional
• Maximum 40 characters
• Only the field matching the chosen fee basis is shown, and only that one is
  saved

**Replacement period**

• Must be one of None, 30, 60, 90 or Custom

**Contract renews**

• Optional
• Must be a valid date

**Off-limits period**

• Whole months between 0 and 60

**Billing email**

• Optional
• Every address entered must be a valid email — "Enter a valid email address"
• Several recipients may be added

**Tax ID / GSTIN**

• Optional
• Maximum 40 characters

---------------------------------------------------------

## Error Scenarios

| Scenario | What the user sees |
|---|---|
| Save with an empty Client name | The field is marked and reads "Company name is required"; the form does not submit and scrolls to the field |
| Client name over 150 characters | "Keep the company name under 150 characters" |
| Phone that does not match the selected country | "Enter a valid phone number for the selected country" |
| A malformed billing email | "Enter a valid email address" on that entry |
| Notes over 5000 characters | "Keep the notes under 5000 characters" |
| Logo larger than 2 MB, or a file type outside PNG/JPEG/WEBP/SVG | The upload is rejected at the tile; nothing is attached |
| Attachment larger than 20 MB, or an unsupported type | The file is rejected in the drop zone; the rest of the form is untouched |
| Upload interrupted mid-progress | The file does not attach; the field stays empty and the user can retry |
| Duplicate client name | **Accepted.** A second client with the same name is created — the module does not detect duplicates |
| Save fails on the server | The form stays filled with every entry intact so the user can retry; no client is created |

---------------------------------------------------------

## Success Flow

1. The client is created with the account manager, address, agreement and files
   attached.
2. "Client created" is confirmed.
3. The user lands back on **Clients**, where the new card is in the grid and the
   summary tiles have moved (unless the client was saved as a Prospect).
4. The client is now selectable everywhere a client is picked — new
   requirements, contacts, invoices and reports.

---------------------------------------------------------

## Alternative Flows

| Flow | What happens |
|---|---|
| **Cancel** | Nothing is saved. The user returns to Clients. Entered values are discarded without a warning prompt |
| **Save & add another** | The client is created and confirmed, the form clears, and the user stays on New Client to add the next one |
| **Create new contact** (from the Primary contact picker) | Opens the Create Contact modal — see feature 3. On save the new contact is selected in the field and the user stays on the form |
| **Create "{name}" as parent company** (from the Parent company picker) | Creates that company as a client record straight away, confirms "{name} created as a client", and selects it as the parent. The new record is a bare client — it can be completed later from Clients |
| Save Draft | Not available |
| Archive from this screen | Not available — archive is offered on the Clients grid and in the record itself |

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Clients |
| **Current Screen** | New Client |
| **Next Screen** | Clients (after Save) · New Client (after Save & add another) · Clients (after Cancel) |

---------------------------------------------------------

## Buttons

| Button | Location | Result |
|---|---|---|
| Save client | Form header (primary) | Validates, creates the client, returns to Clients |
| Save & add another | Form header | Creates the client and clears the form for the next one |
| Cancel | Form header | Discards and returns to Clients |
| Upload logo | Client information | Opens the file picker; shows upload progress and a completion tick |
| Browse or drop a file | Attachments | Opens the file picker for the contract or other files |
| Create new contact | Primary contact picker | Opens the Create Contact modal |
| Create "{name}" as parent company | Parent company picker | Creates and selects the parent company |
| Shipping same as billing | Address | Copies and locks the Office block; clearing it unlocks the fields for separate entry |
| % of CTC / Flat fee | Fee agreement | Switches which fee input is shown |

---

# 3. Quick-create Contact

## Purpose

Let a recruiter add the hiring contact they have in front of them without
abandoning a half-filled client form.

---------------------------------------------------------

## Entry Point

• New Client or Edit Client → Primary contact picker → **Create new contact**

---------------------------------------------------------

## Preconditions

• The user is part-way through the client form
• Whatever the user typed into the picker is carried into the modal as the name

---------------------------------------------------------

## User Flow

### Step 1 — Create Contact

**Screen**
Create Contact (modal) — "Just the essentials — you stay on this client."

**User enters**

| Field | Notes |
|---|---|
| Full name | Required — pre-filled with the search text |
| Role / title | Optional |
| Direct phone | Optional |
| Work email | Optional |

**User clicks**
**Create contact**

**System**

• Creates the contact, splitting the full name into first and last name
• Refreshes the contact picker so the new person appears
• Selects the new contact as the client's primary contact
• Confirms "{name} added as a contact"
• Closes the modal, leaving every other field on the client form untouched

**Next Screen**
Back to New Client / Edit Client

---------------------------------------------------------

## Validations

**Full name**

• Required — "Contact name is required"
• Maximum 150 characters

**Role / title**

• Optional, maximum 150 characters

**Direct phone**

• Optional, maximum 30 characters

**Work email**

• Optional
• Must be a valid email — "Enter a valid email address"
• Maximum 255 characters

---------------------------------------------------------

## Error Scenarios

| Scenario | What the user sees |
|---|---|
| Save with an empty name | "Contact name is required"; the modal stays open |
| Malformed email | "Enter a valid email address"; the modal stays open |
| Creation fails | The modal stays open with the values intact; no contact is selected |

---------------------------------------------------------

## Success Flow

The contact exists in Contacts from that moment, is set as this client's primary
contact, and the recruiter continues filling in the client form exactly where
they left off.

---------------------------------------------------------

## Alternative Flows

| Flow | What happens |
|---|---|
| **Cancel** | The modal closes, no contact is created, and the picker is left as it was |
| Pick an existing contact instead | The modal is never opened; the contact is simply selected |
| Full contact record | The complete contact form lives in the Contacts module; this modal deliberately captures only the essentials |

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | New Client / Edit Client |
| **Current Screen** | Create Contact (modal) |
| **Next Screen** | New Client / Edit Client |

---------------------------------------------------------

## Buttons

| Button | Result |
|---|---|
| Create contact | Creates and selects the contact, closes the modal |
| Cancel | Closes the modal, creating nothing |

---

# 4. Client Details

## Purpose

The single view of an account: whether the client owes the agency a decision,
what is open with them, who to call, what was agreed, and what has happened
lately.

---------------------------------------------------------

## Entry Point

• Clients → a card → **Open client**, or clicking the card
• Dashboard → a client name
• Contact Details → the client panel
• Requirement / Job screens → the client on a requirement
• A shared link to the client

---------------------------------------------------------

## Preconditions

• User is signed in and email-verified
• User's role grants access to the Clients resource
• The client exists and is not archived

---------------------------------------------------------

## User Flow

### Step 1 — Client Details

**Screen**
Client Details

**Purpose**
Read the account and act on it.

**Identity row**

• Company logo tile and client name
• A subtitle line: industry · "Client since {Mon YYYY}" · "Account lead: {name}"
• Status chip — Prospect · Active · Hiring · Paused · Inactive · Blacklisted
• Attention chip — **On track** · **Waiting feedback** · **Invoice overdue** ·
  **Dormant**

The attention chip is worked out from the account itself, worst signal first:
an overdue invoice outranks submissions waiting on feedback, which outranks a
client with no open requirements (Dormant). Everything clear reads On track.

**Feedback SLA strip**

Shown when submissions are waiting on this client:

• "Client waiting — {n} submissions need {client}'s feedback"
• A meter against a **48-hour** feedback SLA
• "{n}h elapsed on oldest"
• A **Review** action

**Four metric tiles**

| Tile | Reads |
|---|---|
| Open jobs | Open requirement count, with "{n} on hold" — opens the Requirements list filtered to this client |
| Active candidates | Candidate count, with "in pipeline" |
| Placements · avg time | Placement count, with "{n} days" |
| Revenue | Billed revenue, with "{amount} outstanding" |

**Submitted CVs — waiting for feedback**

A list of the candidates sitting with this client, each with an AI match
percentage and a **Record feedback** action, plus **View all**.

**Workspace tabs**

| Tab | Shows |
|---|---|
| **Requirements** | Requirement, hiring contact, profile lead, pipeline count, submitted count, status (Open · On hold · Filled · Closed). Empty: "No requirements open with this client yet." |
| **Interviews** | Candidate, requirement, when, panel, status (Confirmed · Completed · Cancelled). Empty: "No interviews scheduled with this client." |
| **Placements** | Candidate, requirement, joined date, guarantee. Empty: "No placements with this client yet." |
| **Invoices** | Invoice number and description, amount, issued date, status (Paid · Due · Overdue). Empty: "No invoices raised for this client yet." |

**Side rail — Client contacts**

Each contact with their role, a PRIMARY badge on the main one, and one-tap mail
and call actions. **View all** opens Contacts. Empty: "No contacts recorded for
this client."

**Side rail — Agreement**

Fee model · Replacement guarantee · Payment terms · Billing email · Tax ID /
GSTIN · Contract renews — the read-back of what was agreed on the client form.

**Side rail — Recent Activity**

The audit feed for this account, filtered by **All · Recruitment · Billing** and
grouped under TODAY / YESTERDAY / EARLIER. **View all** opens the workspace
Audit Log. Empty: "No recent activity."

**User can**

• Raise a new requirement for this client
• Edit the client
• Add a contact for this client
• Open every requirement, interview, placement and invoice
• Record feedback on a waiting submission
• Email or call a contact
• Filter the activity feed
• Open the full audit log

**Next Screen**

• **New requirement** → New Requirement
• **Edit client** → Edit Client
• **Add contact** → New Contact
• **View all roles** → Requirements, filtered to this client
• A row in any workspace tab → that record

---------------------------------------------------------

## Validations

This screen is read-only; it has no form fields to validate. What it enforces is
visibility:

• Archived clients are not reachable here — they are out of the list and out of
  the tiles that count them
• A client with no requirements, contacts, submissions, placements or invoices
  shows the matching empty message in each panel rather than an error
• The SLA strip appears only when there is something actually waiting

---------------------------------------------------------

## Error Scenarios

| Scenario | What the user sees |
|---|---|
| The client id does not exist, or the client was archived | The record does not resolve; the user is returned to Clients |
| The client belongs to another workspace | Not found — records never cross workspace boundaries |
| User lacks Clients permission | Permission Denied |
| A panel's data fails to load | That panel shows its empty message; the rest of the screen stays usable |
| **Share portal** or **Weekly AI Report** clicked | The user is returned to the Clients list — these actions are placeholders and are not yet implemented |

---------------------------------------------------------

## Success Flow

Nothing is saved from this screen. Its success is that the account manager can
see, in one view, what the client owes them (submissions past SLA, overdue
invoices) and act on it without leaving the page.

---------------------------------------------------------

## Alternative Flows

| Flow | What happens |
|---|---|
| **Review** on the SLA strip | Jumps to the waiting submissions so feedback can be chased |
| **Record feedback** on a submission | Opens the candidate record to log the client's decision |
| Switch workspace tab | Swaps the table underneath without leaving the screen |
| Filter the activity feed | Narrows the rail to Recruitment or Billing entries |
| Mail / call a contact | Hands off to the user's mail or phone application |
| Archive | Not offered here — archive is done from the Clients grid |

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Clients · Dashboard · Contact Details · Requirements |
| **Current Screen** | Client Details |
| **Next Screen** | Edit Client · New Requirement · New Contact · Requirements · Contacts · Candidates · Audit Log |

---------------------------------------------------------

## Buttons

| Button | Location | Result |
|---|---|---|
| New requirement | Header (primary) | Opens New Requirement |
| Share portal | Header | **Placeholder** — returns to Clients |
| Weekly AI Report | Header | **Placeholder** — returns to Clients |
| ⋯ menu | Header | Opens Edit client · Add contact · View all roles |
| Edit client | Header menu | Opens Edit Client for this record |
| Add contact | Header menu | Opens New Contact |
| View all roles | Header menu | Opens Requirements filtered to this client |
| Review | SLA strip | Jumps to the waiting submissions |
| Record feedback | Submission row | Opens the candidate to log the outcome |
| View all (Submitted CVs) | Panel header | Opens Candidates |
| View all (Contacts) | Rail | Opens Contacts |
| View all (Activity) | Rail | Opens the Audit Log |
| Requirements / Interviews / Placements / Invoices | Workspace tabs | Switch the table |
| All / Recruitment / Billing | Activity rail | Filter the feed |
| Mail / Call | Contact row | Opens the mail client or dialler |

---

# 5. Edit Client

## Purpose

Keep the record true as the relationship changes — a new account manager, a
renegotiated fee, a move from Prospect to Hiring, a signed contract to attach.

---------------------------------------------------------

## Entry Point

• Clients → card ⋯ menu → **Edit client**
• Client Details → header ⋯ menu → **Edit client**

---------------------------------------------------------

## Preconditions

• User is signed in and email-verified
• User's role grants access to the Clients resource
• The client exists and is not archived

---------------------------------------------------------

## User Flow

### Step 1 — Edit Client

**Screen**
Edit client — "Update this client's details, address and fee agreement."

**Purpose**
Amend an existing client.

**Behaviour**

• The same form as New Client, in the same layout, pre-filled from the record
• Every stored value is loaded back — including the client status, so saving
  does not silently reset a hiring client to Prospect
• Billing email is split back into its individual recipients
• The office address returns locked or unlocked exactly as it was saved
• The fee input shown matches the saved fee basis
• Existing attachments and the logo are listed and can be replaced or removed

**User clicks**
**Save changes**

**System**

• Updates the client
• Re-applies the fee agreement as the default for requirements and invoices
  raised from now on — records already raised are not rewritten
• Confirms "Client updated"

**Next Screen**
Clients

---------------------------------------------------------

## Validations

Identical to Add Client — every rule in feature 2 applies unchanged. In
particular:

• Client name stays required and capped at 150 characters
• Uniqueness is still not enforced — renaming a client to match another is
  allowed
• Clearing an optional field is allowed and clears it on the record

---------------------------------------------------------

## Error Scenarios

| Scenario | What the user sees |
|---|---|
| The client was archived or removed in another session | The form loads empty; the user is returned to Clients |
| Any field validation fails | Same messages as Add Client; nothing is saved |
| Save fails on the server | The form keeps every edit so the user can retry; the stored record is unchanged |
| Two people edit the same client at once | Last save wins — there is no conflict warning |

---------------------------------------------------------

## Success Flow

1. The record is updated.
2. "Client updated" is confirmed.
3. The user lands on **Clients**, where the card reflects the change.
4. A status change is reflected immediately in the status tabs, the health and
   status chips, and the Active Clients tile — moving a client out of Prospect
   brings it into active-client reporting.

---------------------------------------------------------

## Alternative Flows

| Flow | What happens |
|---|---|
| **Cancel** | Edits are discarded, the record is untouched, the user returns to Clients |
| Save & add another | **Not offered on edit** — that action exists only when creating |
| Change the account manager | Ownership moves to the chosen teammate on save |
| Change the status to Inactive or Blacklisted | The client stays in the list and remains selectable; only reporting and the chips change. To take it out of circulation, archive it |
| Create a contact or parent company from the pickers | Works exactly as on New Client |

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Clients · Client Details |
| **Current Screen** | Edit Client |
| **Next Screen** | Clients |

---------------------------------------------------------

## Buttons

| Button | Location | Result |
|---|---|---|
| Save changes | Form header (primary) | Validates, updates the client, returns to Clients |
| Cancel | Form header | Discards and returns to Clients |
| Upload logo / Browse or drop a file | Form body | Replaces the logo or adds attachments |
| Create new contact | Primary contact picker | Opens the Create Contact modal |
| Create "{name}" as parent company | Parent company picker | Creates and selects the parent company |

---

# 6. Archive Client

## Purpose

Retire an account that is no longer worked, without losing the history attached
to it.

---------------------------------------------------------

## Entry Point

• Clients → card ⋯ menu → **Archive**

---------------------------------------------------------

## Preconditions

• User is signed in and email-verified
• User's role grants access to the Clients resource
• The client exists and is not already archived

---------------------------------------------------------

## User Flow

### Step 1 — Archive Client

**Screen**
Archive client (confirmation modal)

**Purpose**
Confirm an action that removes the client from every list and picker.

**User sees**

"Hide {name} from lists and pickers? Their requirements, submissions and
placements are kept, and you can restore them later."

**User clicks**
**Archive client**

**System**

• Marks the client archived
• Removes it from the Clients grid and from every client picker
• Removes it from the summary tiles — an archived client no longer counts
  towards Active Clients
• Keeps its requirements, submissions, placements, invoices and activity
• Refreshes the grid
• Confirms "{name} archived"

**Next Screen**
Clients

---------------------------------------------------------

## Validations

• The confirmation must be given explicitly — the ⋯ menu never archives directly
• Nothing about the client blocks archiving; a client with open requirements can
  still be archived, and those requirements are retained

---------------------------------------------------------

## Error Scenarios

| Scenario | What the user sees |
|---|---|
| Archive fails | The client stays in the grid; nothing is confirmed |
| The client was already archived elsewhere | The card is simply gone on the next refresh |
| User wants it back | **No Restore screen exists.** The record is kept and is reversible in principle, but the interface offers no way to un-archive — this is a known gap |

---------------------------------------------------------

## Success Flow

The card disappears from the grid, the tiles recount without it, and "{name}
archived" is confirmed. Every related record survives untouched and stays
visible from the requirement, candidate and invoice screens that reference it.

---------------------------------------------------------

## Alternative Flows

| Flow | What happens |
|---|---|
| **Cancel** | The modal closes and nothing changes |
| Set the status to Inactive instead | Keeps the client visible and selectable, and only changes how it reports — the softer alternative to archiving |
| Delete | **Not available.** The module archives; it never destroys |
| Restore | **Not available in the interface** |
| Merge duplicates | **Not available** |

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Clients |
| **Current Screen** | Archive client (modal) |
| **Next Screen** | Clients |

---------------------------------------------------------

## Buttons

| Button | Result |
|---|---|
| Archive client | Archives the record, refreshes the grid, confirms |
| Cancel | Closes the modal, changing nothing |

---

# 7. Export Clients

## Purpose

Take the client book out of the product — for a management review, a call sheet
or a board pack.

---------------------------------------------------------

## Entry Point

• Clients → toolbar → **Export**

---------------------------------------------------------

## Preconditions

• User is signed in and email-verified
• User's role grants access to the Clients resource
• At least one client is showing

---------------------------------------------------------

## User Flow

### Step 1 — Export

**Screen**
Clients (the export menu opens over the toolbar)

**User sees**
EXPORT AS — **PDF (.pdf)** · **Excel (.xlsx)** · **Word (.docx)**

**User clicks**
A format.

**System**

• Builds the document from the clients currently visible
• Excel and Word download as a file named after the list
• PDF opens a print view the user can save or print

**Next Screen**
Clients — the user stays where they were

---------------------------------------------------------

## Validations

• The export reflects the **current filters and the current page** — it is not a
  full-database dump
• An empty list produces an empty document

---------------------------------------------------------

## Error Scenarios

| Scenario | What the user sees |
|---|---|
| Nothing matches the filters | An empty document |
| The browser blocks the PDF print window | Nothing opens; the user must allow pop-ups for the site |
| Download blocked by the browser | The file does not arrive; the menu closes regardless |

---------------------------------------------------------

## Success Flow

The file downloads (or the print view opens) and the user remains on Clients
with their filters intact.

---------------------------------------------------------

## Alternative Flows

| Flow | What happens |
|---|---|
| Filter first, then export | The narrowed set is what is exported — the intended way to produce a targeted list |
| Import clients | **Not available** |

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Clients |
| **Current Screen** | Clients (export menu) |
| **Next Screen** | Clients |

---------------------------------------------------------

## Buttons

| Button | Result |
|---|---|
| Export | Opens the format menu |
| PDF (.pdf) | Opens a print view of the visible clients |
| Excel (.xlsx) | Downloads a spreadsheet |
| Word (.docx) | Downloads a document |

---

# 8. Access Denied

## Purpose

Tell a user who reached a client screen without the right to see it what
happened, rather than showing an empty page.

---------------------------------------------------------

## Entry Point

• A direct link to any `/clients` screen from a user whose role does not include
  the Clients resource
• A link shared by a colleague with broader permissions

---------------------------------------------------------

## Preconditions

• User is signed in — an unauthenticated visitor is sent to Sign In first, never
  to this screen

---------------------------------------------------------

## User Flow

### Step 1 — Permission Denied

**Screen**
Permission Denied

**Purpose**
Explain the block and offer a way back.

**User can**

• Return to a screen they are entitled to
• Ask an administrator for the Clients permission

**Next Screen**
Dashboard, or whichever screen their role allows

---------------------------------------------------------

## Validations

• Permission is checked before the screen renders — no client data is fetched
  for a user who may not see it
• The Clients navigation entry is hidden for these users, so the usual way to
  reach this screen is a shared link

---------------------------------------------------------

## Error Scenarios

| Scenario | What the user sees |
|---|---|
| Not signed in | Sign In, not Permission Denied |
| Signed in without Clients access | Permission Denied |
| Permission granted while the user is on the screen | A refresh is required before the module appears |

---------------------------------------------------------

## Success Flow

Not applicable — the flow ends with the user redirected or asking for access.

---------------------------------------------------------

## Alternative Flows

| Flow | What happens |
|---|---|
| Administrator grants the Clients permission | The nav entry appears and every screen in this document becomes reachable |

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Any (via a direct link) |
| **Current Screen** | Permission Denied |
| **Next Screen** | Dashboard |

---------------------------------------------------------

## Buttons

| Button | Result |
|---|---|
| Back / Go to dashboard | Returns the user to a screen their role allows |

---

# Client status — the lifecycle

Status is set on the client form and is the only lifecycle control in the
module. It is chosen by the user; nothing moves it automatically.

| Status | Meaning | Effect |
|---|---|---|
| **Prospect** | Being pursued, nothing agreed | Default on a new client. Excluded from active-client reporting — "Prospects don't count toward active-client reporting" |
| **Active** | Signed, on the books | Counts as an active client |
| **Hiring** | Actively working requirements | Counts as active; appears under the Hiring tab |
| **Paused** | On hold, expected back | Appears under the Paused tab |
| **Inactive** | Dormant relationship | Stays visible and selectable; reporting only |
| **Blacklisted** | Not to be worked | Stays visible as a warning to the team |
| *(Archived)* | Retired | **Not a status** — a separate flag set by Archive. Hidden from every list, picker and tile |

**Health** (Healthy · Attention · At risk · Dormant), shown on the card and used
by the list filter, is derived from account activity rather than chosen by the
user.

**Attention** on Client Details (On track · Waiting feedback · Invoice overdue ·
Dormant) is likewise derived, worst signal first: overdue money, then feedback
owed on submissions, then no open requirements.

---

# Not in this module

Documented so nobody looks for them:

| Not present | Where it actually lives, or why |
|---|---|
| Import clients | Not built |
| Sort control on the list | Not built — the grid is newest-first |
| Delete client | Deliberately absent; the module archives instead |
| Restore / un-archive | A gap — records are kept but nothing surfaces them again |
| Merge duplicate clients | Not built; duplicates are not detected either |
| Save draft | Not built |
| Client-level general email | The client carries a **Billing email** only; person email lives on Contacts |
| Legal name, tags | Not fields on the client |
| Client portal, weekly AI report | Header actions are drawn but not wired |
| Contact management | The **Contacts** module — the client screen links to it |
| Requirements, interviews, placements, invoices | Owned by their own modules; Client Details shows them read-only and links out |
