# Module 09 - Candidates

**Version:** 1.0

------------------------------------------------------------------------

# 1. Overview

The Candidate module is the heart of HirePilotX. It stores every
candidate sourced, imported, or manually created by recruiters.

Candidates may exist independently in the talent pool or be associated
with one or more Jobs.

------------------------------------------------------------------------

# 2. Candidate Lifecycle

``` text
Created
   │
Resume Parsed
   │
Associated to Job
   │
AI Screening
   │
Submitted
   │
Interview
   │
Offer
   │
Hired
```

Alternative Outcomes

-   Rejected
-   Withdrawn
-   On Hold
-   Archived

------------------------------------------------------------------------

# 3. Navigation

Candidates → Add Candidate

OR

Jobs → Candidate Pipeline → Add Candidate

------------------------------------------------------------------------

# 4. Creation Methods

## Method 1 (Recommended)

Resume Upload

Supported formats

-   PDF
-   DOC
-   DOCX

Maximum Size

10 MB

AI automatically extracts

-   Name
-   Email
-   Phone
-   Address
-   Experience
-   Skills
-   Education
-   Employer
-   Job Title
-   LinkedIn
-   Certifications

------------------------------------------------------------------------

## Method 2

Manual Entry

------------------------------------------------------------------------

# 5. Screen Layout

1.  Resume Upload
2.  Basic Information
3.  Professional Details
4.  Skills
5.  Education
6.  Experience
7.  Social Links
8.  Attachments
9.  Associate to Job
10. Other Information

------------------------------------------------------------------------

# 6. Resume Upload

Business Rules

-   Resume upload is shown first.
-   AI parsing starts immediately after upload.
-   User reviews extracted information before saving.
-   Original resume is stored in object storage.

Validation

-   PDF, DOC, DOCX only
-   Maximum size 10 MB

------------------------------------------------------------------------

# 7. Basic Information

## Required Fields

  Field             Required   Validation
  ----------------- ---------- -----------------------
  First Name        Yes        2-100 chars
  Last Name         Yes        2-100 chars
  Email OR Mobile   Yes        At least one required

Optional

-   Profile Photo
-   Date of Birth
-   Gender
-   Nationality

Business Rule

Duplicate detection runs using

-   Email
-   Mobile
-   Resume similarity

------------------------------------------------------------------------

# 8. Professional Details

  Field                 Required
  --------------------- ----------
  Current Job Title     No
  Current Employer      No
  Total Experience      Yes
  Relevant Experience   No
  Current Salary        No
  Expected Salary       No
  Notice Period         No
  Preferred Location    No
  Willing to Relocate   No
  Work Authorization    No

------------------------------------------------------------------------

# 9. Skills

Required

-   Primary Skills

Optional

-   Secondary Skills
-   Certifications
-   Languages

Business Rule

Primary Skills are used by AI Screening.

------------------------------------------------------------------------

# 10. Education

Multiple education records supported.

Fields

-   Degree
-   Institution
-   Specialization
-   Start Year
-   End Year
-   Grade

------------------------------------------------------------------------

# 11. Experience

Multiple employment records supported.

Fields

-   Company
-   Designation
-   Employment Type
-   Start Date
-   End Date
-   Responsibilities

Current Employer

Checkbox

------------------------------------------------------------------------

# 12. Social Links

Optional

-   LinkedIn
-   GitHub
-   Stack Overflow
-   Portfolio
-   Twitter

------------------------------------------------------------------------

# 13. Attachments

Supported

-   Resume
-   Cover Letter
-   Certificates
-   Offer Letter
-   Other Documents

Generated Files

-   Formatted Resume

------------------------------------------------------------------------

# 14. Associate to Job

Required

  Field           Required
  --------------- ----------
  Job             Yes
  Initial Stage   Yes

Pipeline Stages

-   Sourced
-   Connected
-   CV Received
-   Submitted
-   Interview
-   Offer
-   Hired
-   Rejected

Business Rule

Associating a Candidate with a Job automatically triggers AI Screening.

------------------------------------------------------------------------

# 15. Other Information

Fields

-   Owner
-   Source
-   Candidate Status
-   Email Opt-out
-   SMS Opt-out
-   Created By
-   Last Updated

------------------------------------------------------------------------

# 16. Business Rules

-   Candidate can exist without a Job.
-   Candidate can be associated with multiple Jobs.
-   Duplicate Candidates are merged manually.
-   Resume parsing never overwrites manually edited values without
    confirmation.
-   AI Screening begins after Job association.

------------------------------------------------------------------------

# 17. Validation Rules

-   First Name is mandatory.
-   Last Name is mandatory.
-   Email or Mobile is mandatory.
-   Total Experience cannot be negative.
-   Resume must be PDF, DOC or DOCX.

------------------------------------------------------------------------

# 18. Permissions

  Action    Owner   Profile Lead   Recruiter   Viewer
  -------- ------- -------------- ----------- --------
  View        ✓          ✓             ✓         ✓
  Create      ✓          ✓             ✓         ✗
  Edit        ✓          ✓             ✓         ✗
  Delete      ✓          ✓             ✗         ✗
  Export      ✓          ✓             ✓         ✗

------------------------------------------------------------------------

# 19. Activity Log

Capture

-   Candidate created
-   Resume uploaded
-   Resume parsed
-   Candidate updated
-   Candidate associated to Job
-   Candidate merged
-   Candidate archived

Each log stores

-   Timestamp
-   User
-   Action
-   Previous Value
-   New Value

------------------------------------------------------------------------

# 20. Acceptance Criteria

-   Candidate can be created by uploading a Resume.
-   Candidate can be created manually.
-   Duplicate detection runs automatically.
-   AI parsing populates supported fields.
-   Candidate can exist without a Job.
-   AI Screening starts automatically after Job association.

------------------------------------------------------------------------

# Next Module

Module 10 - Candidate Profile
