# Module 08 - Jobs

**Version:** 1.0

------------------------------------------------------------------------

# 1. Overview

The Jobs module manages hiring requirements received from Clients. A Job
represents an open position that recruiters source candidates for.

A Job **cannot exist without a Client**.

A Contact is optional, but when selected, it **must belong to the
selected Client**.

------------------------------------------------------------------------

# 2. Prerequisites

Before creating a Job:

-   Workspace exists
-   User has Create Job permission
-   Client exists
-   Client status is Active
-   At least one recruiter exists

------------------------------------------------------------------------

# 3. Navigation

Jobs → Create Job

OR

Client Details → Jobs → New Job

------------------------------------------------------------------------

# 4. Job Lifecycle

``` text
Draft
   │
   ▼
Open
   │
   ▼
Sourcing
   │
   ▼
Interviewing
   │
   ▼
Offer
   │
   ▼
Filled
   │
   ▼
Closed
```

Alternative Statuses

-   On Hold
-   Cancelled
-   Archived

------------------------------------------------------------------------

# 5. Screen Layout

The Job screen contains:

1.  Basic Information
2.  Location
3.  Job Description
4.  Requirements
5.  Benefits
6.  Skills
7.  Attachments
8.  AI Screening
9.  Assigned Team
10. Publishing

------------------------------------------------------------------------

# 6. Basic Information

## Required Fields

  Field                Required   Validation
  -------------------- ---------- --------------------------------
  Job Title            Yes        3-150 chars
  Client               Yes        Existing Active Client
  Contact              No\*       Must belong to selected Client
  Employment Type      Yes        Dropdown
  Industry             Yes        Dropdown
  Number of Openings   Yes        Positive integer
  Experience           Yes        Min & Max Years
  Job Status           Yes        Default Draft

\*Contact becomes required if the Client has one or more Contacts marked
as Primary.

------------------------------------------------------------------------

# 7. Salary

  Field               Required
  ------------------- ----------
  Salary From         No
  Salary To           No
  Currency            Yes
  Salary Visibility   Yes

Salary Visibility

-   Hidden
-   Display Range
-   Exact Salary

Validation

-   Salary From ≤ Salary To

------------------------------------------------------------------------

# 8. Location

  Field       Required
  ----------- -------------
  Work Mode   Yes
  Country     Conditional
  State       Conditional
  City        Conditional

Work Modes

-   Remote
-   Hybrid
-   On-site

Business Rule

Location fields are optional when Work Mode = Remote.

------------------------------------------------------------------------

# 9. Job Description

Required

-   Job Description

Optional

-   Responsibilities
-   Company Overview
-   Additional Notes

Supports Markdown and AI generation.

------------------------------------------------------------------------

# 10. Skills

Required

-   Must-have Skills

Optional

-   Nice-to-have Skills

Business Rule

AI Screening uses Must-have Skills for match scoring.

------------------------------------------------------------------------

# 11. Benefits

Optional

-   Medical Insurance
-   Bonus
-   Flexible Hours
-   Remote Allowance
-   Relocation Support
-   Other Benefits

------------------------------------------------------------------------

# 12. Attachments

Supported Files

-   JD PDF
-   Job Specification
-   Client Documents

Maximum Size

20 MB

------------------------------------------------------------------------

# 13. AI Screening

Fields

  Field             Required
  ----------------- ----------
  Match Threshold   Yes
  AI Enabled        Yes

Outputs

-   Match %
-   Skills Match
-   Experience Match
-   Salary Fit
-   Watch-outs
-   Strengths

Business Rule

AI Screening starts automatically when a Candidate is associated with
the Job.

------------------------------------------------------------------------

# 14. Assigned Team

  Field                   Required
  ----------------------- ----------
  Recruiter               Yes
  Profile Lead            No
  Daily Sourcing Target   No

Business Rule

Recruiter must be an Active Workspace Member.

------------------------------------------------------------------------

# 15. Publishing

Publish To

-   Internal
-   Career Site
-   External Job Boards

Validation

Job cannot be published until:

-   Client selected
-   Description completed
-   Must-have Skills added
-   Recruiter assigned

------------------------------------------------------------------------

# 16. Business Rules

1.  Job belongs to exactly one Client.
2.  Contact must belong to the selected Client.
3.  Archived Clients cannot receive new Jobs.
4.  Job Title is not required to be unique.
5.  Closing a Job does not remove Candidates.

------------------------------------------------------------------------

# 17. Dependencies

A Job owns:

-   Candidate Associations
-   Interviews
-   AI Screening Results
-   Notes
-   Activity Timeline

------------------------------------------------------------------------

# 18. Validation Rules

-   Client is mandatory.
-   Employment Type is mandatory.
-   Industry is mandatory.
-   Number of Openings must be greater than zero.
-   Experience range cannot be negative.
-   Salary range must be valid.
-   At least one Must-have Skill is required before publishing.

------------------------------------------------------------------------

# 19. Permissions

  Action     Owner   Profile Lead   Recruiter   Viewer
  --------- ------- -------------- ----------- --------
  View         ✓          ✓             ✓         ✓
  Create       ✓          ✓             ✓         ✗
  Edit         ✓          ✓             ✓         ✗
  Publish      ✓          ✓             ✗         ✗
  Archive      ✓          ✓             ✗         ✗

------------------------------------------------------------------------

# 20. Activity Log

Capture:

-   Job created
-   Job updated
-   Job published
-   Recruiter assigned
-   AI settings changed
-   Job closed
-   Job archived

------------------------------------------------------------------------

# 21. Acceptance Criteria

-   Job cannot be created without a Client.
-   Contact must belong to the selected Client.
-   Job cannot be published without a Description, Must-have Skills, and
    Assigned Recruiter.
-   AI Screening starts automatically after Candidate association.

------------------------------------------------------------------------

# Next Module

Module 09 - Candidates
