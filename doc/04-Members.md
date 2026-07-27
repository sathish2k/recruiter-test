# Module 04 - Members

## Overview

The Members module manages all users within a Workspace. Members can be
invited, assigned roles, restricted to specific clients, and managed
throughout their lifecycle.

------------------------------------------------------------------------

# Navigation

Settings → Members

------------------------------------------------------------------------

# Member Lifecycle

1.  Workspace Owner invites a member.
2.  Invitation email is sent.
3.  Member accepts invitation.
4.  Member sets password.
5.  Account becomes Active.
6.  Member signs in.
7.  Member performs recruitment activities.
8.  Member can be disabled or removed.

------------------------------------------------------------------------

# Screen Layout

## Summary Cards

-   Total Seats
-   Seats Used
-   Pending Invitations
-   Active Members
-   Inactive Members

------------------------------------------------------------------------

## Members Table

  Column          Description
  --------------- -----------------------------
  Name            Full name
  Email           Work email
  Role            Assigned role
  Client Access   All Clients / Restricted
  Status          Pending / Active / Disabled
  MFA             Enabled / Disabled
  Last Active     Last login time
  Actions         Edit / Disable / Remove

------------------------------------------------------------------------

# Invite Member

Navigation

Settings → Members → Invite Member

## Required Fields

  Field        Required   Validation
  ------------ ---------- ---------------------------------
  Work Email   Yes        Valid & unique within workspace
  Role         Yes        Existing role

## Optional Fields

  Field             Description
  ----------------- ------------------------------
  First Name        Optional before acceptance
  Last Name         Optional before acceptance
  Client Access     Restrict to selected clients
  Welcome Message   Custom invitation message

------------------------------------------------------------------------

# Business Rules

-   Only Workspace Owner can invite members.
-   Duplicate invitations are not allowed.
-   Invitations expire after the configured period.
-   Invitation links are single-use.
-   Seat availability is checked before sending an invitation.

------------------------------------------------------------------------

# Edit Member

Editable Fields

-   Role
-   Client Access
-   Status
-   MFA Requirement

Non-editable

-   Email (after invitation accepted)

------------------------------------------------------------------------

# Client Access

Options

-   All Clients
-   Selected Clients Only

If restricted:

-   Member can only view assigned Clients.
-   Jobs, Contacts and Candidates related to unassigned Clients are
    hidden.

------------------------------------------------------------------------

# Member Status

  Status     Description
  ---------- ------------------------------------
  Pending    Invitation sent but not accepted
  Active     User can sign in
  Disabled   Sign-in blocked
  Removed    Membership removed, audit retained

------------------------------------------------------------------------

# Remove Member

Preconditions

-   Member must not be the only Workspace Owner.
-   Open assignments should be reassigned.

System Actions

-   Remove workspace access.
-   Preserve audit history.
-   Preserve ownership history.
-   Reassign active work if configured.

------------------------------------------------------------------------

# Disable Member

Effects

-   User cannot sign in.
-   Existing data is retained.
-   Activity history remains available.

------------------------------------------------------------------------

# Multi-Factor Authentication (MFA)

Fields

  Field            Required
  ---------------- ----------
  MFA Enabled      Optional
  Recovery Email   Optional

Business Rules

-   Owners should be encouraged to enable MFA.
-   MFA status is visible in the Members list.

------------------------------------------------------------------------

# Validation Rules

-   Email must be unique within the workspace.
-   Role is mandatory.
-   At least one active Workspace Owner must always exist.
-   Client restrictions can only reference existing Clients.

------------------------------------------------------------------------

# Permissions

  Action            Owner   Profile Lead   Recruiter   Viewer
  ---------------- ------- -------------- ----------- --------
  View Members        ✓          ✓             ✓         ✗
  Invite Member       ✓          ✗             ✗         ✗
  Edit Member         ✓          ✗             ✗         ✗
  Disable Member      ✓          ✗             ✗         ✗
  Remove Member       ✓          ✗             ✗         ✗

------------------------------------------------------------------------

# Activity Log

The following actions must be recorded:

-   Member invited
-   Invitation resent
-   Invitation accepted
-   Role changed
-   Client access updated
-   MFA enabled/disabled
-   Member disabled
-   Member re-enabled
-   Member removed

Each log entry should capture: - Timestamp - User performing the
action - Affected member - Previous value (if applicable) - New value
(if applicable)

------------------------------------------------------------------------

# Acceptance Criteria

-   Owner can invite members.
-   Duplicate invitations are prevented.
-   Seat limits are enforced.
-   Member permissions are applied immediately after role changes.
-   Removing a member preserves historical data and audit logs.

------------------------------------------------------------------------

# Next Module

Module 05 - Roles & Permissions Configuration
