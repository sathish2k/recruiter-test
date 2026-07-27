# Module 03 - Workspace

## Purpose

A Workspace represents a recruitment agency. All users, clients,
contacts, jobs, candidates and settings belong to exactly one workspace.

------------------------------------------------------------------------

# Preconditions

-   User has verified email.
-   User is Workspace Owner.
-   Workspace is created during registration.

------------------------------------------------------------------------

# Navigation

Settings → Workspace

------------------------------------------------------------------------

# Screen Sections

1.  General
2.  Branding
3.  Recruitment Defaults
4.  Number Prefixes
5.  Business Hours
6.  Regional Settings

------------------------------------------------------------------------

# General Information

  Field         Required   Validation        Notes
  ------------- ---------- ----------------- ---------------------------------
  Agency Name   Yes        3-150 chars       Unique within workspace display
  Legal Name    No         3-200 chars       Optional
  Website       No         Valid URL         HTTPS preferred
  Phone         No         Valid phone       
  Email         No         Valid email       General contact
  Country       Yes        Dropdown          
  Timezone      Yes        Dropdown          Used for scheduling
  Currency      Yes        ISO Currency      Default billing currency
  Language      Yes        Default English   Future multi-language

------------------------------------------------------------------------

# Branding

  Field                Required
  -------------------- ----------
  Logo                 No
  Accent Color         No
  Email From Name      Yes
  Email From Address   Yes
  Reply-To Address     No
  Email Signature      No

Business Rules

-   From Address must be verified before emails are sent.
-   Logo appears on formatted resumes and reports.

------------------------------------------------------------------------

# Recruitment Defaults

  Field                      Required
  -------------------------- ----------
  Default Placement Fee      No
  Default Notice Period      No
  Resume Privacy             Yes
  Candidate Owner Strategy   Yes
  Job Visibility             Yes

Defaults

-   Resume Privacy = Internal
-   Candidate Owner = Creator
-   Job Visibility = Workspace

------------------------------------------------------------------------

# Number Prefixes

  Entity      Example
  ----------- -----------
  Client      CLI-00001
  Contact     CON-00001
  Job         JOB-00001
  Candidate   CAN-00001
  Placement   PLC-00001
  Invoice     INV-00001

Business Rule

Changing prefixes does not update existing records.

------------------------------------------------------------------------

# Business Hours

Required

-   Working Days
-   Start Time
-   End Time

Used By

-   Interview scheduling
-   Calendar availability
-   SLA calculations

------------------------------------------------------------------------

# Validation Rules

-   Agency Name cannot be empty.
-   Country, Timezone and Currency are mandatory.
-   Email addresses must be valid.
-   Logo accepts PNG, JPG or SVG.
-   Maximum logo size: 5 MB.

------------------------------------------------------------------------

# Dependencies

Workspace owns:

-   Members
-   Clients
-   Contacts
-   Jobs
-   Candidates
-   Interviews
-   Placements
-   Settings

Deleting a workspace is disabled from the UI.

------------------------------------------------------------------------

# Activity Log

Capture:

-   Workspace created
-   Branding updated
-   Business hours changed
-   Prefix updated
-   Regional settings changed

------------------------------------------------------------------------

# Permissions

  Action    Owner   Profile Lead   Recruiter
  -------- ------- -------------- -----------
  View        ✓          ✓             ✗
  Edit        ✓          ✗             ✗

------------------------------------------------------------------------

# Acceptance Criteria

-   Owner can update workspace settings.
-   Required fields are validated before save.
-   Changes are audited.
-   Branding is reflected in emails and exported resumes.

------------------------------------------------------------------------

# Next Module

Module 04 - Members
