# Module 02 - User Roles & Permissions

# Overview

This module defines the security model for HirePilotX. Every user
belongs to a Workspace and is assigned a Role. Permissions determine
which actions the user can perform.

------------------------------------------------------------------------

# Roles

## Workspace Owner

Full access to all modules.

Responsibilities: - Manage workspace - Invite/remove members - Billing -
Security - Roles - Clients - Jobs - Candidates - Reports

------------------------------------------------------------------------

## Profile Lead

Responsible for delivery and candidate quality.

Can: - Manage jobs - Assign recruiters - Review candidates - Submit
candidates - Schedule interviews - View reports

Cannot: - Delete workspace - Billing - Security settings

------------------------------------------------------------------------

## Recruiter

Responsible for sourcing candidates.

Can: - Create candidates - Edit own candidates - Create contacts -
Create clients - Create jobs - Schedule interviews - Add notes - Upload
resumes

Cannot: - Manage billing - Change workspace settings - Delete members

------------------------------------------------------------------------

## Viewer

Read-only access.

Can: - View clients - View jobs - View candidates - Export reports
(optional)

Cannot create or modify records.

------------------------------------------------------------------------

# Permission Matrix

  Module             Owner   Profile Lead      Recruiter      Viewer
  ----------------- ------- -------------- ----------------- --------
  Dashboard            ✓          ✓                ✓            ✓
  Clients            CRUD        CRUD         Create/Edit      View
  Client Contacts    CRUD        CRUD         Create/Edit      View
  Jobs               CRUD        CRUD         Create/Edit      View
  Candidates         CRUD        CRUD       Create/Edit Own    View
  AI Screening         ✓          ✓                ✓           View
  Interviews         CRUD        CRUD            CRUD          View
  Offers             CRUD        CRUD            View          View
  Placements         CRUD        CRUD            View          View
  Reports              ✓          ✓             Limited        View
  Members            CRUD        View            View           No
  Billing            CRUD         No              No            No
  Settings           CRUD      Limited            No            No

CRUD = Create, Read, Update, Delete

------------------------------------------------------------------------

# Invitation Flow

Preconditions

-   Only Owner can invite members.
-   Seat must be available.

Navigation

Settings → Members → Invite Member

Required Fields

  Field        Required
  ------------ ----------
  Work Email   Yes
  Role         Yes

Optional Fields

-   Client access restriction
-   Welcome message

Flow

1.  Click Invite Member.
2.  Enter work email.
3.  Select role.
4.  Send invitation.
5.  Invitation email sent.
6.  User accepts.
7.  User sets password.
8.  Member becomes Active.

------------------------------------------------------------------------

# Business Rules

-   Email must be unique within a workspace.
-   One user belongs to one role at a time.
-   Role changes are audited.
-   Disabled users cannot sign in.
-   Removing a user does not delete created data.

------------------------------------------------------------------------

# Activity Log

Record: - Invitation sent - Invitation accepted - Role changed - Member
disabled - Member removed

------------------------------------------------------------------------

# Acceptance Criteria

-   Owner can invite members.
-   Duplicate invitations are prevented.
-   Role permissions are enforced throughout the application.
-   Unauthorized actions return an access denied message.

------------------------------------------------------------------------

# Next Module

Module 03 - Workspace
