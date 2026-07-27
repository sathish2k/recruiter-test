# Module 05 - Roles & Permissions Configuration

## Overview

The Roles & Permissions module allows the Workspace Owner to define what
each role can access and what actions users can perform across
HirePilotX.

------------------------------------------------------------------------

# Navigation

Settings → Roles & Permissions

------------------------------------------------------------------------

# Objectives

-   Protect sensitive information
-   Control module access
-   Restrict actions by role
-   Support custom roles in future versions

------------------------------------------------------------------------

# Default Roles

  Role              Description
  ----------------- ------------------------------------------
  Workspace Owner   Full administrative access
  Profile Lead      Delivery management and candidate review
  Recruiter         Recruitment operations
  Viewer            Read-only access

------------------------------------------------------------------------

# Screen Layout

The screen contains:

1.  Role List
2.  Permission Matrix
3.  Save Changes
4.  Reset to Default

------------------------------------------------------------------------

# Permission Types

Each permission supports one of the following values:

  Value       Description
  ----------- -------------------------
  No Access   Module hidden
  View        Read-only
  Create      Create records
  Edit        Modify existing records
  Delete      Remove records
  Export      Download data
  Manage      Full administration

------------------------------------------------------------------------

# Module Permissions

## Dashboard

-   View Dashboard

## Clients

-   View Clients
-   Create Client
-   Edit Client
-   Archive Client
-   Delete Client
-   Export Clients

## Client Contacts

-   View Contacts
-   Create Contact
-   Edit Contact
-   Delete Contact
-   Export Contacts

Business Rule: A Contact always belongs to a Client. Users without
Client access cannot access that Client's Contacts.

## Jobs

-   View Jobs
-   Create Job
-   Edit Job
-   Publish Job
-   Archive Job
-   Delete Job

Business Rule: Creating a Job requires Create Client permission if the
workflow allows creating a Client inline.

## Candidates

-   View Candidates
-   Create Candidate
-   Edit Candidate
-   Delete Candidate
-   Export Candidate
-   Upload Resume
-   Generate Formatted Resume

## AI

-   View AI Results
-   Run AI Screening
-   Generate Job Description
-   Rewrite Email Templates

## Interviews

-   Schedule Interview
-   Edit Interview
-   Cancel Interview
-   Record Feedback

## Offers

-   Create Offer
-   Approve Offer
-   View Offer

## Placements

-   Create Placement
-   Edit Placement
-   View Placement

## Reports

-   View Reports
-   Export Reports

## Members

-   Invite Member
-   Edit Member
-   Disable Member
-   Remove Member

## Workspace

-   View Workspace
-   Edit Workspace

## Billing

-   View Billing
-   Manage Subscription

------------------------------------------------------------------------

# Permission Inheritance

-   Workspace Owner has all permissions.
-   Users receive permissions from exactly one assigned role.
-   Permission changes apply immediately.
-   Existing audit history is never modified.

------------------------------------------------------------------------

# Validation Rules

-   At least one Workspace Owner must exist.
-   A role cannot remove its own ability to access the Roles &
    Permissions module while editing.
-   Invalid permission combinations are rejected.

------------------------------------------------------------------------

# Audit Log

Record: - Role updated - Permission granted - Permission revoked - Role
assigned to member

Each entry includes: - Timestamp - User - Role - Permission changed -
Previous value - New value

------------------------------------------------------------------------

# Acceptance Criteria

-   Permission changes take effect immediately.
-   Hidden modules are not visible in navigation.
-   Unauthorized API requests return Access Denied.
-   Audit entries are generated for all permission changes.

------------------------------------------------------------------------

# Next Module

Module 06 - Clients
