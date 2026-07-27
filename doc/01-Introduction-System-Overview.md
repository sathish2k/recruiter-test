# HirePilotX Functional Specification

## Module 01 -- Introduction & System Overview

Version: 1.0

------------------------------------------------------------------------

# Purpose

HirePilotX is an AI-powered Applicant Tracking System (ATS) designed
primarily for recruitment agencies. It manages the complete recruitment
lifecycle from client onboarding to placement.

------------------------------------------------------------------------

# Primary Users

-   Workspace Owner
-   Profile Lead
-   Recruiter
-   Viewer (optional)

------------------------------------------------------------------------

# Core Modules

1.  Workspace
2.  Members
3.  Roles & Permissions
4.  Clients
5.  Client Contacts
6.  Jobs
7.  Candidates
8.  Candidate Profile
9.  AI Screening
10. Interviews
11. Offers
12. Placements
13. Analytics
14. Billing
15. Settings
16. Integrations

------------------------------------------------------------------------

# End-to-End Workflow

``` text
Create Workspace
      │
Invite Members
      │
Create Client
      │
Add Client Contacts
      │
Create Job Requirement
      │
Publish Job
      │
Add Candidate
      │
AI Resume Parsing
      │
Associate Candidate to Job
      │
AI Screening
      │
Submit Candidate
      │
Schedule Interview
      │
Collect Feedback
      │
Generate Offer
      │
Placement
      │
Analytics & Reporting
```

------------------------------------------------------------------------

# Core Relationships

-   One Workspace has many Members.
-   One Workspace has many Clients.
-   One Client has many Contacts.
-   One Client has many Jobs.
-   One Job has many Candidates.
-   One Candidate can exist without a Job.
-   One Candidate can later be associated with multiple Jobs (submission
    history).
-   Interviews require both a Candidate and a Job.
-   Placements require an accepted Offer.

------------------------------------------------------------------------

# Navigation

Dashboard

-   Clients
-   Contacts
-   Jobs
-   Candidates
-   Interviews
-   Placements
-   Reports
-   Settings

Settings contains:

-   Workspace
-   Members
-   Roles & Permissions
-   Integrations
-   Email Templates
-   Billing
-   Security

------------------------------------------------------------------------

# Design Principles

-   Resume-first workflow
-   AI assists but does not replace recruiter decisions
-   Minimal data entry
-   Contextual actions
-   Consistent layout across modules
-   Audit trail for major actions

------------------------------------------------------------------------

# Next Module

Module 02 -- User Roles & Permissions
