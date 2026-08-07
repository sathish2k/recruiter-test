# Authentication — Functional User Flow

The complete end-to-end journey through every authentication screen, written from
the user's point of view.

**Module contents**

| # | Feature | Screen |
|---|---|---|
| 1 | Create Account | Create Account |
| 2 | Verify Email | Verify Email · Email Verified · Link Expired |
| 3 | Login | Sign In |
| 4 | Forgot Password | Reset Your Password · Check Your Inbox |
| 5 | Reset Password | Set a New Password · Password Updated · Link Not Valid |
| 6 | Logout | (menu action — no screen) |
| 7 | Access Denied | Permission Denied |
| 8 | Page Not Found | Not Found |
| 9 | Account Locked | Account Temporarily Locked |
| 10 | Session Expired | You've Been Signed Out |
| 11 | Something Went Wrong | Server Error |
| 12 | Terms & Privacy | Terms of Service · Privacy Policy |

---

## Read this before writing tests

The sample template used to request this document contains example rules that do
**not** match what is built. Documented here is the real behaviour. The
differences that matter to QA:

| Sample rule | Actual behaviour |
|---|---|
| Create Account has "Confirm Password" | **No confirm field.** The password is entered once. Confirm exists only on Reset Password. |
| Password needs uppercase + lowercase + number + special character | **Minimum 8 characters only.** A strength meter is shown, but it is advisory — a weak 8-character password is accepted. |
| Agency Name must be unique | **Not unique.** Signing up with an existing agency name joins that workspace rather than being rejected. |
| Verify Email leads to Login | **Leads to the setup wizard**, not back to sign-in. |

Account Locked, Session Expired and the server-error screen are now built and are
documented below. The only screen from the sample still absent is a dedicated 401
page, which is not needed — see [Not in this module](#not-in-this-module).

---

# 1. Create Account

## Purpose

Lets a new recruiter sign up, creating both their personal login and the agency
workspace they will own, in a single step.

---------------------------------------------------------

## Entry Point

• Marketing site "Start free trial" call to action
• "Start your 14-day free trial" link at the foot of the Sign In screen
• "Use a different email" link on the Verify Email screen
• Direct link shared by a colleague

---------------------------------------------------------

## Preconditions

• User is not signed in
• User has a work email address they can receive mail at
• User is authorised to create a workspace on behalf of their agency (self-declared
  as part of accepting the terms)

---------------------------------------------------------

## User Flow

### Step 1 — Create Account

**Screen**
Create Account

**User sees**

• Title "Create your account"
• Subtitle "You own the workspace you create. Invite the rest of the desk once
  you're in."
• A side panel headed "Free trial — Start with one client." with the note
  "14 days free · No card required · Cancel any time"

**User enters**

• First Name
• Last Name
• Agency Name
• Work Email
• Password

**User selects**

• Accept Terms of Service and Privacy Policy, and confirm they are authorised to
  create a workspace for this agency

**User clicks**

Create account

**System Action**

• Creates the user's login
• Creates the agency workspace, or joins the existing one if that agency is
  already on the platform
• Makes the user the Owner of a brand-new workspace, or a Recruiter when joining
  an existing one
• Creates the person record for the user inside the workspace
• Prepares the workspace's permissions and email templates
• Sends the verification email — a 6-digit code and a sign-in link

**Next Screen**

Verify Email — with the email address carried across, so the user does not retype it

---------------------------------------------------------

## Validations

**First Name**

• Required
• Minimum 2 characters
• Maximum 50 characters

**Last Name**

• Required
• Minimum 2 characters
• Maximum 50 characters

**Agency Name**

• Required
• Minimum 2 characters
• Maximum 50 characters
• **Not required to be unique** — a matching name joins the existing workspace

**Work Email**

• Required
• Must be a valid email address
• Must not already have an account (checked when the form is submitted, not while
  typing)

**Password**

• Required
• Minimum 8 characters
• A strength indicator updates as the user types; it is guidance only and does not
  block submission

**Terms & Conditions**

• Must be accepted before the account can be created

---------------------------------------------------------

## Error Scenarios

**A required field is empty, or too short or too long**

↓

Show the message under that field

↓

Stay on Create Account — nothing is submitted

---------------------------------------------------------

**Email format is invalid**

↓

Show "Enter a valid email address" under the field

↓

Stay on Create Account

---------------------------------------------------------

**Password is shorter than 8 characters**

↓

Show "At least 8 characters" under the field

↓

Stay on Create Account

---------------------------------------------------------

**Terms not accepted**

↓

Outline the checkbox in red and show "You must accept the terms to continue"

↓

Stay on Create Account — the account is not created

---------------------------------------------------------

**Email already has an account**

↓

Show a banner above the form: "That email already has an account. Sign in instead,
or use a different work email."

↓

Stay on Create Account. The banner clears as soon as the user edits any field.

---------------------------------------------------------

**Sign-up cannot be completed (connection lost, service unavailable)**

↓

Show a banner above the form: "We couldn't create your account just now. Please
try again."

↓

Stay on Create Account, with everything the user typed still in place

---------------------------------------------------------

**The account is created but the verification email fails to send**

↓

The user still reaches Verify Email — the account is not lost

↓

They use "Send the code again" to trigger a fresh email

---------------------------------------------------------

## Success Scenarios

Account and workspace created

↓

User becomes Owner of the new workspace

↓

Verification email sent

↓

Redirect to Verify Email

---------------------------------------------------------

## Alternative Flows

Create Account

↓

"Already have an account? Sign in"

↓

Sign In

---------------------------------------------------------

Create Account

↓

Agency already exists on the platform

↓

User joins that workspace as a Recruiter rather than an Owner

↓

Verify Email

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Marketing site, or Sign In |
| **Current Screen** | Create Account |
| **Next Screen** | Verify Email |
| **Back Action** | Browser back, or the "Sign in" footer link |
| **Cancel Action** | None — no cancel control; leaving the screen abandons the form |

---------------------------------------------------------

## Buttons

**Primary**

Create account

**Text Link**

Sign in (footer) · Terms of Service · Privacy Policy

---------------------------------------------------------

## Screen Components

• Brand backdrop
• Side panel — kicker, headline, supporting line, footer note
• Card containing the form
• Title
• Subtitle
• First Name and Last Name inputs, side by side on desktop, stacked on mobile
• Agency Name input
• Work Email input
• Password input with show/hide toggle and strength meter
• Terms consent checkbox with inline Terms and Privacy links
• Error banner (when sign-up fails)
• Primary button
• Small print repeating the Terms and Privacy links
• Footer — "Already have an account? Sign in"

---

# 2. Verify Email

## Purpose

Confirms the user owns the email address they signed up with, before they are
allowed to create records or send mail from the workspace.

---------------------------------------------------------

## Entry Point

• Automatically after Create Account
• The sign-in link in the verification email
• Returning to the verification link later from the same email

---------------------------------------------------------

## Preconditions

• An account exists for this email address
• The email address has not already been verified
• No sign-in is required — the screen works straight from the emailed link

---------------------------------------------------------

## User Flow

### Step 1 — Verify Email

**Screen**
Verify Email

**User sees**

• Title "Verify your email"
• "We sent a 6-digit code and a sign-in link to **[their email]**. The code
  expires in **[live countdown]**." — the address and the countdown are emphasised,
  and the countdown ticks down from 30:00
• Guidance: "Nothing in the inbox? Check spam, then confirm your IT team allows
  mail from notifications@hirepilotx.com."
• A side panel headed "One more step — We send mail as you."
• **No skip option anywhere on this screen** — verification cannot be bypassed

**User enters**

• 6-digit verification code (typed or pasted; the field is a row of six cells)

**OR**

Clicks the verification link in the email, which opens this screen and verifies
automatically with nothing to type

**User clicks**

Verify email

**System Action**

• Marks the email address as verified
• Retires the code and the link so neither can be used again

**Next Screen**

Email Verified

---------------------------------------------------------

### Step 2 — Email Verified

**Screen**
Email Verified

**User sees**

• Title "Email verified"
• "Your workspace is live. Sign in and a short setup wizard will walk you through it."
• A preview of what comes next — "Setup wizard · about 3 minutes", describing the
  five steps: workspace conventions, pipeline stages, rejection reasons, the team,
  then a review
• Reassurance that everything the wizard sets can be changed later in Settings

**User clicks**

Go to setup

**Next Screen**

Setup wizard (Get Started)

---------------------------------------------------------

### Alternate Step — Link Expired

**Screen**
Verification Link Expired

Reached when the user opens a verification link more than 30 minutes old, opens a
link that has already been used, or enters a code the system reports as expired.

**User sees**

• Title "This link has expired"
• "Verification links last 30 minutes. Send a fresh one to **[their email]** and it
  arrives in a few seconds."
• Reassurance: "Your workspace and any invites you already sent are untouched —
  only this link stopped working."

**User clicks**

Send a fresh link

**System Action**

• Issues a new code and link, invalidating any previous one
• Restarts the 30-minute countdown
• Starts a 60-second wait before another can be requested

**Next Screen**

Verify Email (the code entry screen), with a fresh countdown

---------------------------------------------------------

## Validations

**Verification Code**

• Required
• Exactly 6 characters
• Digits only
• Must match the most recently sent code — older codes stop working the moment a
  new one is issued
• Expires 30 minutes after it was sent
• 5 incorrect attempts against the same code invalidate it; a new code must be
  requested

**Resend**

• Only once every 60 seconds
• Maximum 5 codes per hour per account
• The button shows the remaining wait while it is unavailable

**Verification Link**

• Expires 30 minutes after it was sent
• Single use — a second click reports the link as no longer valid

---------------------------------------------------------

## Error Scenarios

**Code field empty**

↓

Show "Enter the 6-digit code we sent you"

↓

Stay on Verify Email

---------------------------------------------------------

**Code is not 6 digits**

↓

Show "That code should be 6 digits"

↓

Stay on Verify Email

---------------------------------------------------------

**Code is wrong**

↓

Show "That code didn't match. Check the latest email — older codes stop working."

↓

Allow retry — up to 5 attempts on the same code

---------------------------------------------------------

**Code has expired**

↓

Switch to the Link Expired screen

↓

Offer "Send a fresh link"

---------------------------------------------------------

**5 wrong attempts on the same code**

↓

Show "Too many attempts. Request a new code to continue."

↓

The code is dead — the user must request a new one

---------------------------------------------------------

**Resend pressed during the 60-second wait**

↓

The button is disabled and reads "Send again in [n]s"

↓

Stay on Verify Email

---------------------------------------------------------

**More than 5 codes requested in an hour**

↓

Show "Too many codes requested this hour. Try again later."

↓

Stay on Verify Email

---------------------------------------------------------

**Verification link expired or already used**

↓

Show the Link Expired screen

↓

Allow "Send a fresh link"

---------------------------------------------------------

**User tries to create records before verifying**

↓

The action is refused with a message asking them to verify their email address
first

↓

Browsing and reading remain available

---------------------------------------------------------

## Success Scenarios

Correct code entered, or valid link opened

↓

Email address marked as verified

↓

Email Verified screen

↓

"Go to setup" → setup wizard

---------------------------------------------------------

**Already verified**

User opens the screen for an address that is already verified

↓

Treated as success rather than an error — the Email Verified screen is shown

---------------------------------------------------------

## Alternative Flows

Verify Email

↓

Expired link

↓

Send a fresh link

↓

Verify again

---------------------------------------------------------

Verify Email

↓

"Use a different email"

↓

Create Account (to sign up with the correct address)

---------------------------------------------------------

Verify Email

↓

"Wrong account? Sign in as someone else"

↓

Sign In

---------------------------------------------------------

Verify Email

↓

User opens the emailed link on another device

↓

Verified automatically there, with nothing to type

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Create Account, or the email client |
| **Current Screen** | Verify Email · Email Verified · Link Expired |
| **Next Screen** | Setup wizard (Get Started) |
| **Back Action** | "Use a different email" → Create Account |
| **Cancel Action** | None — verification cannot be skipped or dismissed |

---------------------------------------------------------

## Buttons

**Primary**

Verify email · Send a fresh link (expired state) · Go to setup (verified state)

**Text Link**

Send the code again · Use a different email · Sign in as someone else

---------------------------------------------------------

## Screen Components

• Brand backdrop
• Side panel — "One more step"
• Card
• State icon — neutral while pending, success on verified, alert on expired
• Title
• Subtitle with the user's email address emphasised and a live countdown
• Six-cell code input
• Error banner
• Action row — resend and change-email
• Guidance note about spam folders and the sender address
• Wizard preview panel (verified state only)
• Primary button
• Footer — "Wrong account? Sign in as someone else"

---

# 3. Login

## Purpose

Signs an existing user into their workspace.

---------------------------------------------------------

## Entry Point

• Direct visit to the sign-in page
• "Sign in" footer link on Create Account
• "Back to sign in" on Forgot Password or Reset Password
• "Go to sign in" after a password change
• "Sign in as someone else" on Verify Email
• Automatically, when someone not signed in tries to open any page inside the app
• After signing out

---------------------------------------------------------

## Preconditions

• User is not signed in
• An account exists for the email address

*Note: an unverified user can sign in and look around. Verification is enforced
when they try to create records or send mail, not at the sign-in door.*

---------------------------------------------------------

## User Flow

### Step 1 — Sign In

**Screen**
Sign In

**User sees**

• Title "Sign in"
• Subtitle "Use the work account your HirePilotX workspace was created with."
• A side panel headed "Agency workspace — Source. Submit. Place."

**User enters**

• Work Email
• Password

**User selects**

• "Keep me signed in" — **on by default**; the user may switch it off

**User clicks**

Sign in

**System Action**

• Checks the address is not currently locked out
• Verifies the credentials
• Starts the session
• Records the sign-in — successful, failed or blocked — in the workspace's login
  history and audit trail

**Next Screen**

Dashboard

---------------------------------------------------------

## Validations

**Work Email**

• No checks are made before submitting — the field is sent as typed and the system
  decides

**Password**

• No checks are made before submitting

*This is deliberate. The sign-in screen never hints at which half of the pair was
wrong, so it does not validate either field on its own.*

---------------------------------------------------------

## Error Scenarios

**Wrong email, wrong password, or no such account**

↓

Show one banner above the form: "Incorrect email or password. Please try again."

↓

Stay on Sign In. The banner clears as soon as the user edits either field.

*The same message is shown in every case — the screen never reveals whether the
address exists.*

---------------------------------------------------------

**Both fields left empty**

↓

The same generic message — the fields are submitted as typed

↓

Stay on Sign In

---------------------------------------------------------

**Five attempts in a row fail**

↓

The sixth is refused before the password is even checked

↓

The form is replaced by the Account Locked screen with a countdown — see
[Account Locked](#9-account-locked)

---------------------------------------------------------

**User is signed in but lacks permission for the page they land on**

↓

Permission Denied screen

---------------------------------------------------------

## Success Scenarios

Credentials accepted

↓

Session started

↓

Sign-in recorded in the audit trail

↓

Dashboard

---------------------------------------------------------

## Alternative Flows

Sign In

↓

Forgot password?

↓

Reset Your Password

↓

Set a New Password

↓

Sign In

---------------------------------------------------------

Sign In

↓

"New to HirePilotX? Start your 14-day free trial"

↓

Create Account

---------------------------------------------------------

User opens a page inside the app while signed out

↓

Sent to Sign In

↓

Signs in

↓

Dashboard

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Any — this is where signed-out users are sent |
| **Current Screen** | Sign In |
| **Next Screen** | Dashboard |
| **Back Action** | None |
| **Cancel Action** | None |

---------------------------------------------------------

## Buttons

**Primary**

Sign in

**Text Link**

Forgot password? · Start your 14-day free trial (footer)

**Control**

Keep me signed in (checkbox, on by default)

---------------------------------------------------------

## Screen Components

• Brand backdrop
• Side panel — "Agency workspace"
• Card
• Title
• Subtitle
• Error banner
• Work Email input
• Password input with show/hide toggle
• "Keep me signed in" checkbox and "Forgot password?" link, on one row
• Primary button
• Footer — "New to HirePilotX? Start your 14-day free trial"

---

# 4. Forgot Password

## Purpose

Sends a single-use link to a user who cannot sign in, so they can set a new
password.

---------------------------------------------------------

## Entry Point

• "Forgot password?" on the Sign In screen
• "Send a fresh link" on the Link Not Valid screen

---------------------------------------------------------

## Preconditions

• User is not signed in
• User knows the email address they sign in with

---------------------------------------------------------

## User Flow

### Step 1 — Request the Link

**Screen**
Reset Your Password

**User sees**

• Title "Reset your password"
• Subtitle "Enter the work email you sign in with. If an account exists, the link
  is on its way."
• A note: "The link works once and expires after 30 minutes. If you didn't ask for
  it, no action is needed — your password stays as it is."
• A side panel headed "Account recovery — Back in two minutes."

**User enters**

• Work Email

**User clicks**

Send reset link

**System Action**

• Sends a single-use reset link, if an account exists for that address
• Answers the same way whether or not it does

**Next Screen**

Check Your Inbox (the same screen, switched to its confirmation state)

---------------------------------------------------------

### Step 2 — Check Your Inbox

**Screen**
Check Your Inbox

**User sees**

• Title "Check your inbox"
• "We sent a reset link to **[their email]**. It expires in 30 minutes and can
  only be used once."

**User clicks**

The link in their email — which opens Set a New Password

**Or, on this screen**

• Send the link again — available after a 60-second wait
• Use a different email — returns to the form

---------------------------------------------------------

## Validations

**Work Email**

• Required
• Must be a valid email address
• **No check that the account exists** — an unknown address produces the same
  confirmation as a known one, so the screen cannot be used to discover who has an
  account

**Send the link again**

• Only once every 60 seconds
• The button shows the remaining wait while unavailable

---------------------------------------------------------

## Error Scenarios

**Email field empty**

↓

Show "Work email is required"

↓

Stay on the form

---------------------------------------------------------

**Email format invalid**

↓

Show "Enter a valid email address"

↓

Stay on the form

---------------------------------------------------------

**Address has no account**

↓

**No error.** The confirmation screen is shown exactly as it would be for a real
account, and no email is sent.

↓

This is intentional — the screen must not reveal who has an account

---------------------------------------------------------

**Request cannot be sent (connection lost, service unavailable)**

↓

Show a banner: "We couldn't send the link just now. Check your connection and try
again."

↓

Stay on the form — the confirmation is **not** shown, so the user is never told a
link was sent when it wasn't

---------------------------------------------------------

**"Send the link again" pressed during the 60-second wait**

↓

The control is disabled and reads "Send again in [n]s"

↓

Nothing is sent

---------------------------------------------------------

## Success Scenarios

Email submitted

↓

Reset link sent (if the account exists)

↓

Check Your Inbox

↓

User opens the link

↓

Set a New Password

---------------------------------------------------------

## Alternative Flows

Reset Your Password

↓

"Remembered it? Back to sign in"

↓

Sign In

---------------------------------------------------------

Check Your Inbox

↓

Wrong address entered

↓

"Use a different email"

↓

Back to the form

---------------------------------------------------------

Check Your Inbox

↓

Email never arrives

↓

Wait 60 seconds

↓

"Send the link again"

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Sign In |
| **Current Screen** | Reset Your Password → Check Your Inbox |
| **Next Screen** | Set a New Password (from the email) |
| **Back Action** | "Use a different email" returns from the confirmation to the form |
| **Cancel Action** | "Back to sign in" |

---------------------------------------------------------

## Buttons

**Primary**

Send reset link

**Text Link**

Send the link again · Use a different email · Back to sign in (footer)

---------------------------------------------------------

## Screen Components

• Brand backdrop
• Side panel — "Account recovery"
• Card
• State icon — success tick on the confirmation state
• Title
• Subtitle, with the email address emphasised on the confirmation state
• Error banner
• Work Email input
• Primary button
• Reassurance note about single use and expiry
• Action row on the confirmation state — resend and change-email
• Footer — "Remembered it? Back to sign in"

---

# 5. Reset Password

## Purpose

Lets a user set a new password using the link they were emailed, and signs every
other device out of the account.

---------------------------------------------------------

## Entry Point

• The reset link in the password-reset email

---------------------------------------------------------

## Preconditions

• User has received a reset email
• The link is less than 30 minutes old
• The link has not already been used
• No sign-in is required — holding the link is what grants access

---------------------------------------------------------

## User Flow

### Step 1 — Set a New Password

**Screen**
Set a New Password

**User sees**

• Title "Set a new password"
• Subtitle "Choose a password you don't use anywhere else."
• A note: "Saving a new password signs out every other device on the account,
  including mobile."
• A side panel headed "Account security — New password. Fresh sessions."

**User enters**

• New Password
• Confirm Password

**User clicks**

Save new password

**System Action**

• Sets the new password
• Signs out every other session on the account
• Records the change in the workspace audit log
• Consumes the link so it cannot be used again

**Next Screen**

Password Updated

---------------------------------------------------------

### Step 2 — Password Updated

**Screen**
Password Updated

**User sees**

• Title "Password updated"
• "Sign in with the new password. Every other session was signed out just now."
• A summary of what happened:
  – Sessions ended → All other devices
  – Logged to → Workspace audit log

**User clicks**

Go to sign in

**Next Screen**

Sign In

---------------------------------------------------------

### Alternate Step — Link Not Valid

**Screen**
Link Not Valid

Reached when the link was truncated by the mail client, has expired, has already
been used, or a newer reset link has replaced it.

**User sees**

• Title "This link isn't valid"
• An explanation that the link may have been copied incompletely, or that the
  password has already been reset with a newer link
• Reassurance:
  – "Your account is unchanged and still secure."
  – "Your current password still works, if you remember it."

**User clicks**

Send a fresh link

**Next Screen**

Reset Your Password

---------------------------------------------------------

## Validations

**New Password**

• Required
• Minimum 8 characters
• A strength indicator updates as the user types; guidance only, does not block

**Confirm Password**

• Required
• Must match the new password exactly

**Reset Link**

• Must be present and complete
• Expires 30 minutes after it was sent
• Single use — consumed the moment a password is saved
• Superseded whenever a newer reset link is requested

---------------------------------------------------------

## Error Scenarios

**New Password empty**

↓

Show "Password is required"

↓

Stay on the form

---------------------------------------------------------

**New Password shorter than 8 characters**

↓

Show "At least 8 characters"

↓

Stay on the form

---------------------------------------------------------

**Confirm Password empty**

↓

Show "Confirm your new password"

↓

Stay on the form

---------------------------------------------------------

**Passwords do not match**

↓

Show "Both passwords need to match."

↓

Stay on the form

---------------------------------------------------------

**Link is incomplete or missing**

↓

Show the Link Not Valid screen immediately, before anything is typed

↓

Offer "Send a fresh link"

---------------------------------------------------------

**Link has expired or was already used**

↓

Detected when the user saves. Switch to the Link Not Valid screen.

↓

Offer "Send a fresh link" — the password entered is discarded and the account is
untouched

---------------------------------------------------------

**Password cannot be saved (connection lost, service unavailable)**

↓

Show a banner: "We couldn't save the new password just now. Please try again."

↓

Stay on the form with the entries intact — the success screen is **not** shown

---------------------------------------------------------

## Success Scenarios

New password saved

↓

Every other device signed out

↓

Change written to the audit log

↓

Password Updated

↓

"Go to sign in" → Sign In

---------------------------------------------------------

## Alternative Flows

Set a New Password

↓

"Back to sign in"

↓

Sign In (password unchanged)

---------------------------------------------------------

Link Not Valid

↓

Send a fresh link

↓

Reset Your Password

↓

Check Your Inbox

↓

Set a New Password

---------------------------------------------------------

User is signed in elsewhere when the password changes

↓

That device is signed out

↓

Next action there sends them to Sign In

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Email client |
| **Current Screen** | Set a New Password → Password Updated, or Link Not Valid |
| **Next Screen** | Sign In |
| **Back Action** | "Back to sign in" |
| **Cancel Action** | Leaving the screen — the password is unchanged |

---------------------------------------------------------

## Buttons

**Primary**

Save new password · Go to sign in (success state) · Send a fresh link (invalid state)

**Text Link**

Back to sign in (footer)

---------------------------------------------------------

## Screen Components

• Brand backdrop
• Side panel — "Account security"
• Card
• State icon — success tick when updated, alert when the link is invalid
• Title
• Subtitle
• Error banner
• New Password input with show/hide toggle and strength meter
• Confirm Password input with show/hide toggle
• Note about other devices being signed out
• Summary rows (success state)
• Reassurance list (invalid state)
• Primary button
• Footer — "Back to sign in"

---

# 6. Logout

## Purpose

Ends the user's session and returns them to the sign-in screen.

---------------------------------------------------------

## Entry Point

• Avatar menu in the top bar → "Sign out"

*There is no logout screen, no confirmation dialog and no logout page. It is a
single menu action.*

---------------------------------------------------------

## Preconditions

• User is signed in

---------------------------------------------------------

## User Flow

### Step 1 — Sign Out

**Screen**
Any screen inside the app

**User clicks**

Avatar → Sign out (shown last in the menu, styled as a destructive action)

**System Action**

• Ends the session
• Clears everything held about the user in the browser

**Next Screen**

Sign In

---------------------------------------------------------

## Validations

None — the action takes effect immediately with no confirmation step.

---------------------------------------------------------

## Error Scenarios

**Sign-out cannot reach the service**

↓

The user is still returned to Sign In and the browser is still cleared

↓

The session is cleaned up on the server side separately

*The user is never left stranded on a half-signed-out screen.*

---------------------------------------------------------

## Success Scenarios

Sign out clicked

↓

Session ended

↓

Sign In

---------------------------------------------------------

## Alternative Flows

Settings → Security

↓

"Sign out all sessions"

↓

Every device signed out, not just this one

---------------------------------------------------------

Password changed via Reset Password

↓

Every other device signed out automatically

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Any signed-in screen |
| **Current Screen** | — (menu action) |
| **Next Screen** | Sign In |
| **Back Action** | None — the browser back button will not restore the session |
| **Cancel Action** | Close the menu without choosing Sign out |

---------------------------------------------------------

## Buttons

**Menu Item**

Sign out — with a sign-out icon, presented as destructive

---------------------------------------------------------

## Screen Components

• Avatar button in the top bar
• Dropdown menu — user name, role, workspace, then navigation entries, with Sign
  out in its own section at the bottom

---

# 7. Access Denied

## Purpose

Tells a signed-in user that their role does not include permission for the page
they tried to open, and points them at who can change that.

---------------------------------------------------------

## Entry Point

• Automatically, whenever a user opens a page their role does not cover — whether
  by clicking through, using a bookmark, or following a shared link

---------------------------------------------------------

## Preconditions

• User is signed in
• The page requires a permission the user's role does not have

---------------------------------------------------------

## User Flow

### Step 1 — Permission Denied

**Screen**
Permission Denied

**User sees**

• Title "This page is locked for your role"
• "Your current role doesn't include this permission. A workspace admin can grant
  it in Settings → Roles & permissions."
• "Error code: 403 · Need help? Contact your admin"

**User clicks**

Back to my dashboard

**Next Screen**

Dashboard

---------------------------------------------------------

## Validations

None — the screen collects no input.

---------------------------------------------------------

## Error Scenarios

This screen **is** the error state for the module. It has no failure modes of its
own.

---------------------------------------------------------

## Success Scenarios

User reads why they were blocked

↓

Returns to their dashboard

↓

Contacts an admin out of band if they need the permission

---------------------------------------------------------

## Alternative Flows

Permission Denied

↓

An admin grants the role the permission

↓

User revisits the page

↓

Page opens normally

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Whichever page was blocked |
| **Current Screen** | Permission Denied |
| **Next Screen** | Dashboard |
| **Back Action** | "Back to my dashboard" |
| **Cancel Action** | None |

---------------------------------------------------------

## Buttons

**Primary**

Back to my dashboard

---------------------------------------------------------

## Screen Components

• Full-screen branded error layout
• Lock illustration
• Headline
• Explanatory line
• Primary button
• Error line with the code and the "contact your admin" pointer

*There is no "Request access" control. It was removed because nothing was sent
when it was pressed — see [Not in this module](#not-in-this-module).*

---

# 8. Page Not Found

## Purpose

Tells the user the address they opened does not exist, and gets them back to
somewhere that does.

---------------------------------------------------------

## Entry Point

• Any unrecognised address — a mistyped URL, a stale bookmark, a link to something
  that has been removed or renamed

---------------------------------------------------------

## Preconditions

None. The screen is shown whether or not the user is signed in.

---------------------------------------------------------

## User Flow

### Step 1 — Not Found

**Screen**
Not Found

The address the user typed stays in the address bar — they are not redirected, so
they can see and correct what they entered.

**User sees**

• Title "The pilot left this page"
• "It was moved, renamed, or never took off. Check the link — or fly back to
  somewhere that exists."
• "Error code: 404"

**User clicks**

Back to Dashboard

**Next Screen**

Dashboard — or Sign In, if they are not signed in

---------------------------------------------------------

## Validations

None — the screen collects no input.

---------------------------------------------------------

## Error Scenarios

This screen **is** the error state. It has no failure modes of its own.

---------------------------------------------------------

## Success Scenarios

User recognises the address was wrong

↓

Corrects it, or returns to the dashboard

---------------------------------------------------------

## Alternative Flows

Not Found (while signed out)

↓

Back to Dashboard

↓

Sent to Sign In, because the dashboard needs a session

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Any |
| **Current Screen** | Not Found |
| **Next Screen** | Dashboard, or Sign In |
| **Back Action** | Browser back |
| **Cancel Action** | None |

---------------------------------------------------------

## Buttons

**Primary**

Back to Dashboard

---------------------------------------------------------

## Screen Components

• Full-screen branded error layout
• Illustration
• Headline
• Explanatory line
• Primary button
• Error line

---

# 9. Account Locked

## Purpose

Stops an account accepting sign-ins after repeated wrong passwords, and tells the
user exactly how long they have to wait.

---------------------------------------------------------

## Entry Point

• Automatically, on the sign-in attempt that follows five failed ones

---------------------------------------------------------

## Preconditions

• Five sign-in attempts for the same email address have failed within the last
  fifteen minutes
• The user is not signed in

---------------------------------------------------------

## User Flow

### Step 1 — Account Temporarily Locked

**Screen**
Account Temporarily Locked (replaces the sign-in form in place)

**User sees**

• Title "Account temporarily locked"
• "Too many sign-in attempts failed, so we've paused this account for a few
  minutes. Nothing has changed — it unlocks on its own."
• A live countdown labelled "Unlocks in", counting down in minutes and seconds
• A security note: "If this wasn't you, someone may be guessing your password.
  Reset it once the account unlocks, and it will be safe again."
• **No email or password fields** — there is nothing to submit while the lock
  stands

**User waits, or clicks**

Reset my password instead

**System Action while locked**

• Every further attempt is refused before the password is checked, so the account
  cannot be probed while locked
• Each refusal is written to the workspace's login history and audit trail as a
  blocked attempt

**Next Screen**

Sign In — the form returns by itself the moment the countdown reaches zero

---------------------------------------------------------

## Validations

**Lock trigger**

• 5 failed attempts
• Within a 15-minute window
• Counted per email address

**Lock release**

• The account reopens as the failures age out of the window — for the usual burst
  of wrong passwords in quick succession, that is fifteen minutes from the last one
• Nothing has to be run, requested, or clicked to unlock it
• A successful sign-in clears the run, so earlier failures never carry forward
• Retrying while locked does **not** extend the lock

---------------------------------------------------------

## Error Scenarios

**User attempts to sign in while locked**

↓

The attempt is refused without the password being checked

↓

The locked screen stays, with the countdown continuing

---------------------------------------------------------

**The wait is not known**

↓

The screen shows fifteen minutes rather than a countdown it cannot honour

---------------------------------------------------------

**User closes the browser and returns**

↓

The lock is still in force — it lives with the account, not the browser

↓

The next attempt shows the locked screen again with the remaining time

---------------------------------------------------------

## Success Scenarios

Countdown reaches zero

↓

Sign-in form returns automatically

↓

User signs in normally

---------------------------------------------------------

## Alternative Flows

Account Locked

↓

"Reset my password instead"

↓

Reset Your Password

↓

Check Your Inbox

↓

Set a New Password

↓

Sign In

---------------------------------------------------------

Account Locked

↓

User waits out the countdown

↓

Sign In

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Sign In |
| **Current Screen** | Account Temporarily Locked |
| **Next Screen** | Sign In (automatically, when the countdown ends) |
| **Back Action** | None |
| **Cancel Action** | None — the lock cannot be dismissed |

---------------------------------------------------------

## Buttons

**Text Link**

Reset my password instead · Start your 14-day free trial (footer)

*There is no primary button — waiting is the action.*

---------------------------------------------------------

## Screen Components

• Brand backdrop
• Side panel — "Agency workspace"
• Card
• Lock icon in an alert-toned tile
• Title
• Subtitle
• Countdown panel — "Unlocks in" label above a large monospaced timer
• Security note with a shield icon
• Reset-password link
• Footer — "New to HirePilotX? Start your 14-day free trial"

---

# 10. Session Expired

## Purpose

Tells a user whose session ended while they were working what happened, rather
than leaving stale data on screen or bouncing them somewhere with no explanation.

---------------------------------------------------------

## Entry Point

• Automatically, the moment a signed-in user's session is rejected — on whatever
  screen they happen to be on

---------------------------------------------------------

## Preconditions

• User was signed in
• Their session has ended — it lapsed, they signed out elsewhere, or a password
  change revoked every other session

---------------------------------------------------------

## User Flow

### Step 1 — You've Been Signed Out

**Screen**
Session Expired (replaces whatever the user was looking at)

**User sees**

• A padlock mark
• Title "You've been signed out"
• "Your session ended, so we stopped here rather than losing track of what you
  were doing. Sign in again to pick up where you left off."
• A note: "Sessions end after a period of inactivity, or when the password changes"

**User clicks**

Sign in again

**System Action**

• Clears the stale session from the browser
• Signs out cleanly

**Next Screen**

Sign In

---------------------------------------------------------

## Validations

None — the screen collects no input.

---------------------------------------------------------

## Error Scenarios

**A public screen makes a request without a session**

↓

**No screen.** This is an ordinary unauthenticated call, not an expiry, and the
user is left where they are.

*This distinction matters: only a request that carried a session and was refused
counts as expiry.*

---------------------------------------------------------

**Several requests fail at once**

↓

The screen appears once, not once per failed request

---------------------------------------------------------

## Success Scenarios

Session rejected

↓

Session Expired screen replaces the page

↓

"Sign in again"

↓

Sign In

↓

User signs back in and continues

---------------------------------------------------------

## Alternative Flows

User changes their password on another device

↓

This device's session is revoked

↓

Next action here shows Session Expired

---------------------------------------------------------

User signs out all sessions from Settings → Security

↓

Other devices show Session Expired on their next action

---------------------------------------------------------

User opens a fresh page after the session ended, rather than acting on the
current one

↓

Sent straight to Sign In by the page guard, without this screen

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Any signed-in screen |
| **Current Screen** | Session Expired |
| **Next Screen** | Sign In |
| **Back Action** | None — the browser back button will not restore the session |
| **Cancel Action** | None |

---------------------------------------------------------

## Buttons

**Primary**

Sign in again

---------------------------------------------------------

## Screen Components

• Full-screen branded layout
• Padlock mark
• Headline
• Explanatory line
• Primary button
• Note explaining why sessions end

---

# 11. Something Went Wrong

## Purpose

Catches an unexpected failure and says so plainly, instead of leaving the user on
a blank or half-drawn page.

---------------------------------------------------------

## Entry Point

• Automatically, when a screen fails to render

---------------------------------------------------------

## Preconditions

None. It appears wherever the failure happens, signed in or not.

---------------------------------------------------------

## User Flow

### Step 1 — Server Error

**Screen**
Server Error

**User sees**

• "500" with the brand mark as the middle character
• Title "That one's on us"
• "Something broke on our side, not yours. Nothing you were working on has been
  lost — try again, and if it keeps happening let support know."
• "Error code: 500"

**User clicks**

Try again — which re-renders the screen that failed

**Or**

Back to Dashboard

**Next Screen**

Whichever screen failed (if the retry succeeds), or Dashboard

---------------------------------------------------------

## Validations

None — the screen collects no input.

---------------------------------------------------------

## Error Scenarios

**The retry fails again**

↓

The same screen returns

↓

The user can retry again or leave for the dashboard

---------------------------------------------------------

**The failure is severe enough to take the whole page frame down**

↓

A self-contained version of the same screen is shown, carrying its own styling

↓

Same two choices

---------------------------------------------------------

## Success Scenarios

"Try again" clicked

↓

The screen re-renders successfully

↓

The user continues where they were

---------------------------------------------------------

## Alternative Flows

Server Error

↓

Back to Dashboard

↓

Dashboard — or Sign In, if not signed in

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Whichever screen failed |
| **Current Screen** | Server Error |
| **Next Screen** | The failed screen, or Dashboard |
| **Back Action** | Browser back |
| **Cancel Action** | None |

---------------------------------------------------------

## Buttons

**Primary**

Try again

**Secondary**

Back to Dashboard

---------------------------------------------------------

## Screen Components

• Full-screen branded layout
• "500" with the brand mark as the middle character
• Headline
• Explanatory line
• Primary and secondary buttons
• Error line

*This screen always shows English, even for a user working in another language.
It is the screen that has to appear when other things have failed, so it does not
depend on anything that could fail with them.*

---

# 12. Terms & Privacy

## Purpose

Gives the consent checkbox on Create Account something real to point at.

---------------------------------------------------------

## Entry Point

• "Terms of Service" and "Privacy Policy" links in the consent line on Create
  Account
• The same two links repeated in the small print below the sign-up form

---------------------------------------------------------

## Preconditions

None. Both pages are public and need no account.

---------------------------------------------------------

## User Flow

### Step 1 — Read the Document

**Screen**
Terms of Service, or Privacy Policy

**User sees**

• "Back to sign up" link at the top
• Document title
• A status line reading "Draft — not yet reviewed"
• A warning band stating the text is placeholder wording that has not been
  reviewed by a lawyer, and must be replaced before launch
• An introduction, then eight numbered sections
• A closing line saying where to send questions

**User clicks**

Back to sign up

**Next Screen**

Create Account

---------------------------------------------------------

## Validations

None — the pages collect no input.

---------------------------------------------------------

## Error Scenarios

None. Both pages are static and load without any data.

---------------------------------------------------------

## Success Scenarios

User reads the document

↓

Returns to sign up

↓

Ticks the consent checkbox

↓

Creates their account

---------------------------------------------------------

## Alternative Flows

Create Account

↓

Terms of Service

↓

Back to sign up

↓

Privacy Policy

↓

Back to sign up

---------------------------------------------------------

## Navigation

| | |
|---|---|
| **Previous Screen** | Create Account |
| **Current Screen** | Terms of Service, or Privacy Policy |
| **Next Screen** | Create Account |
| **Back Action** | "Back to sign up", or browser back |
| **Cancel Action** | None |

---------------------------------------------------------

## Buttons

**Text Link**

Back to sign up

---------------------------------------------------------

## Screen Components

• Back link
• Document title
• Draft status line
• Draft warning band
• Introduction paragraph
• Eight numbered sections, each a heading and a paragraph
• Closing contact line

**Content status.** Both documents describe how the product actually behaves —
workspaces and roles, email verification, what is collected at sign-in, how long
things are kept, who the data reaches. They are accurate but **not legally
reviewed**, and the warning band on each page says so. Replacing the wording is a
content task, not a build one; removing the band is a one-line change once the
approved text is in.

---

# End-to-end journeys

## New user, happy path

Marketing site

↓

Create Account — name, agency, work email, password, accept terms

↓

Verify Email — enter the 6-digit code, or open the emailed link

↓

Email Verified

↓

Setup wizard (about 3 minutes, five steps)

↓

Dashboard

---------------------------------------------------------

## Returning user

Sign In — email, password, keep me signed in

↓

Dashboard

---------------------------------------------------------

## Forgotten password

Sign In

↓

Forgot password?

↓

Reset Your Password — enter work email

↓

Check Your Inbox

↓

Open the emailed link

↓

Set a New Password — new password, confirm

↓

Password Updated — every other device signed out

↓

Sign In

↓

Dashboard

---------------------------------------------------------

## Verification link goes stale

Create Account

↓

Verify Email

↓

User leaves it more than 30 minutes and then opens the link

↓

Link Expired

↓

Send a fresh link

↓

Verify Email (fresh countdown)

↓

Email Verified

---------------------------------------------------------

## Reset link goes stale

Check Your Inbox

↓

User opens the link the next day

↓

Link Not Valid — account untouched, old password still works

↓

Send a fresh link

↓

Reset Your Password

---------------------------------------------------------

## Joining an agency already on the platform

Create Account with an agency name that already exists

↓

User joins that workspace as a Recruiter rather than creating a new one as Owner

↓

Verify Email

↓

Setup wizard

↓

Dashboard, with a Recruiter's permissions

---------------------------------------------------------

## Blocked by role

User opens a page their role does not cover

↓

Permission Denied

↓

Back to my dashboard

---

# Not in this module

**401 Unauthorized**

There is no screen showing "401", and none is needed. Both ways a request can be
unauthorised already have a destination: a signed-out user opening a page inside
the app is sent to Sign In by the page guard, and a session that dies mid-visit
shows [Session Expired](#10-session-expired).

**Request access (on Permission Denied)**

Previously a button that appeared to submit a request and told the user they would
be notified. Nothing was ever sent, stored, or notified, so it was removed and the
screen now names the real remedy — a workspace admin, in Settings → Roles &
permissions. Reinstating it needs a request to be recorded and an admin to be
notified.

**Two-factor authentication**

Not built. The sign-in screen used to claim two-factor was required on every
workspace; the claim was removed rather than the feature invented.

---

# Change log for this document

| Change | Detail |
|---|---|
| Account Locked built | 5 failures in 15 minutes; self-releasing; countdown on the sign-in screen |
| Session Expired built | Mid-visit 401 replaces the page with an explanation |
| Server Error built | 500 boundary, with a self-contained variant for total failures |
| Terms & Privacy built | `/terms` and `/privacy`, linked from consent; wording is a reviewed-pending draft |
