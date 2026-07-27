# Module 06 - Clients

**Version:** 1.0\
**Module:** Client Management

------------------------------------------------------------------------

# 1. Overview

The Client module manages companies that engage the recruitment agency
to fill job positions.

A Client is the parent entity for:

-   Client Contacts
-   Jobs
-   Placements
-   Revenue
-   Notes
-   Attachments

A Client **must exist before**:

-   Creating a Client Contact
-   Creating a Job
-   Submitting Candidates

------------------------------------------------------------------------

# 2. User Story

As a Recruiter,

I want to create a Client,

So that I can create Contacts and Jobs for that organization.

------------------------------------------------------------------------

# 3. Navigation

Dashboard

→ Clients

→ New Client

------------------------------------------------------------------------

# 4. Screen Layout

The Create Client screen contains the following sections:

1.  Company Information
2.  Business Information
3.  Primary Address
4.  Recruitment Defaults
5.  Additional Information
6.  Attachments

------------------------------------------------------------------------

# 5. Company Information

## Required Fields

  Field          Required   Validation
  -------------- ---------- -------------------
  Company Name   Yes        3--150 characters
  Industry       Yes        Dropdown
  Country        Yes        Dropdown

## Optional Fields

  Field
  ----------------
  Company Code
  Website
  Company Email
  Phone Number
  LinkedIn
  Company Size
  Annual Revenue

------------------------------------------------------------------------

# 6. Primary Address

Fields

  Field            Required
  ---------------- ----------
  Address Line 1   No
  Address Line 2   No
  City             No
  State            No
  Postal Code      No
  Country          Yes

------------------------------------------------------------------------

# 7. Recruitment Defaults

  Field                        Required
  ---------------------------- ----------
  Default Placement Fee (%)    No
  Default Currency             Yes
  Default Notice Period        No
  Preferred Recruitment Type   No

Recruitment Types

-   Permanent
-   Contract
-   Temporary
-   Executive Search

------------------------------------------------------------------------

# 8. Client Status

Available Statuses

-   Active
-   Prospect
-   Inactive
-   Archived

Business Rules

-   Archived Clients cannot have new Jobs.
-   Inactive Clients remain searchable.
-   Prospect Clients can be converted to Active.

------------------------------------------------------------------------

# 9. Business Rules

## Rule 1

A Client Name must be unique within the Workspace.

------------------------------------------------------------------------

## Rule 2

A Client must exist before creating a Client Contact.

If no Client exists,

the Add Contact action must display:

> Please create a Client before adding Contacts.

------------------------------------------------------------------------

## Rule 3

A Client must exist before creating a Job.

------------------------------------------------------------------------

## Rule 4

Deleting a Client is not allowed if:

-   Jobs exist
-   Contacts exist
-   Placements exist

Instead,

Archive the Client.

------------------------------------------------------------------------

## Rule 5

Multiple Contacts belong to one Client.

Relationship

Workspace

└── Client

├── Contact A

├── Contact B

└── Contact C

------------------------------------------------------------------------

# 10. Validation Rules

Company Name

-   Required
-   Minimum 3 characters
-   Maximum 150 characters

Website

-   Valid HTTPS URL

Email

-   Valid email format

Phone

-   International format

Placement Fee

-   Between 0 and 100

------------------------------------------------------------------------

# 11. Permissions

  Action     Owner   Profile Lead   Recruiter   Viewer
  --------- ------- -------------- ----------- --------
  View         ✓          ✓             ✓         ✓
  Create       ✓          ✓             ✓         ✗
  Edit         ✓          ✓             ✓         ✗
  Archive      ✓          ✓             ✗         ✗
  Delete       ✓          ✗             ✗         ✗

------------------------------------------------------------------------

# 12. Activity Log

Record the following:

-   Client Created
-   Client Updated
-   Client Archived
-   Client Restored
-   Recruitment Defaults Changed
-   Address Updated

Each activity stores:

-   Timestamp
-   User
-   Action
-   Previous Value
-   New Value

------------------------------------------------------------------------

# 13. Dependencies

A Client owns:

-   Contacts
-   Jobs
-   Candidate Submissions
-   Placements
-   Notes
-   Attachments

Changing the Client name automatically updates references throughout the
application.

------------------------------------------------------------------------

# 14. Acceptance Criteria

-   Client cannot be saved without Company Name.
-   Client cannot be saved without Industry.
-   Client cannot be saved without Country.
-   Duplicate Company Names are rejected.
-   Archived Clients cannot receive new Jobs.
-   Contacts cannot be created without selecting an existing Client.

------------------------------------------------------------------------

# 15. Next Module

Module 07 - Client Contacts
