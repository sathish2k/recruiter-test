# Module 10 - Candidate Profile

**Version:** 1.0

------------------------------------------------------------------------

# 1. Overview

The Candidate Profile is the central workspace for recruiters. It
consolidates all information related to a candidate, including AI
screening, submissions, interviews, notes, attachments, and activity
history.

------------------------------------------------------------------------

# 2. Navigation

Candidates → Candidate List → Open Candidate

OR

Jobs → Candidate Pipeline → Open Candidate

------------------------------------------------------------------------

# 3. Screen Layout

The profile is divided into the following sections:

1.  Header
2.  AI Screening Report
3.  Professional Summary
4.  Experience Timeline
5.  Education
6.  Skills
7.  Attachments
8.  Notes
9.  Interviews
10. Activity Timeline
11. Sidebar

------------------------------------------------------------------------

# 4. Header

## Display

-   Candidate Name
-   Current Job Title
-   Current Employer
-   Overall Match %
-   Pipeline Stage
-   Status
-   Owner

## Primary Actions

-   Edit Candidate
-   Associate to Job
-   Submit to Client
-   Schedule Interview
-   Download Resume
-   Generate Formatted Resume
-   Archive Candidate

------------------------------------------------------------------------

# 5. AI Screening Report

## Sections

  Section            Description
  ------------------ -------------------------
  Overall Match      Combined AI score
  Skills Match       Skills comparison
  Experience Match   Years and relevance
  Salary Fit         Compensation comparison
  Strengths          Positive highlights
  Watch-outs         Potential concerns

Business Rules

-   AI report is available only after Job association.
-   Re-running AI creates a new report version.

------------------------------------------------------------------------

# 6. Professional Summary

Displays:

-   Total Experience
-   Current Employer
-   Current Designation
-   Current Salary
-   Expected Salary
-   Notice Period
-   Preferred Location
-   Work Authorization
-   Relocation Preference

------------------------------------------------------------------------

# 7. Experience Timeline

Supports multiple records.

Fields:

-   Company
-   Designation
-   Start Date
-   End Date
-   Employment Type
-   Responsibilities

Business Rules

-   Current employment has no End Date.
-   Timeline is sorted by most recent first.

------------------------------------------------------------------------

# 8. Education

Displays all education records.

Fields

-   Degree
-   Institution
-   Specialization
-   Start Year
-   End Year
-   Grade

------------------------------------------------------------------------

# 9. Skills

Sections

-   Primary Skills
-   Secondary Skills
-   Certifications
-   Languages

Business Rules

-   Primary Skills are highlighted in AI Screening.

------------------------------------------------------------------------

# 10. Attachments

Supported Documents

-   Original Resume
-   Formatted Resume
-   Cover Letter
-   Certificates
-   Offer Letters
-   Other Files

Maximum File Size

20 MB

------------------------------------------------------------------------

# 11. Notes

Supports

-   Rich text
-   Mentions
-   Follow-up reminders
-   Internal comments

Notes are visible only within the workspace.

------------------------------------------------------------------------

# 12. Interviews

Displays

-   Upcoming Interviews
-   Completed Interviews
-   Interview Feedback
-   Interview Outcome

Actions

-   Schedule
-   Reschedule
-   Cancel
-   View Feedback

------------------------------------------------------------------------

# 13. Activity Timeline

Tracks:

-   Candidate created
-   Resume uploaded
-   Resume parsed
-   AI screening completed
-   Submitted to client
-   Interview scheduled
-   Offer generated
-   Placement completed

Each event records:

-   Date & Time
-   User
-   Action
-   Details

------------------------------------------------------------------------

# 14. Sidebar

Displays:

-   Contact Information
-   Associated Jobs
-   Current Stage
-   Source
-   Owner
-   Last Activity
-   Email Opt-Out
-   SMS Opt-Out

------------------------------------------------------------------------

# 15. Business Rules

1.  Candidate can be linked to multiple Jobs.
2.  Profile data is shared across all Job associations.
3.  AI reports are Job-specific.
4.  Attachments remain with the Candidate profile.
5.  Activity history cannot be deleted.

------------------------------------------------------------------------

# 16. Validation Rules

-   Candidate must exist before opening profile.
-   Job-specific actions require an associated Job.
-   Only supported file formats can be uploaded.

------------------------------------------------------------------------

# 17. Permissions

  Action                Owner   Profile Lead   Recruiter   Viewer
  -------------------- ------- -------------- ----------- --------
  View Profile            ✓          ✓             ✓         ✓
  Edit Profile            ✓          ✓             ✓         ✗
  Submit to Client        ✓          ✓             ✓         ✗
  Schedule Interview      ✓          ✓             ✓         ✗
  Archive                 ✓          ✓             ✗         ✗

------------------------------------------------------------------------

# 18. Acceptance Criteria

-   Candidate profile opens from Candidate List and Job Pipeline.
-   AI report displays after Job association.
-   Experience and Education support multiple records.
-   Activity timeline records all significant actions.
-   Recruiters can schedule interviews directly from the profile.

------------------------------------------------------------------------

# Next Module

Module 11 - AI Screening
