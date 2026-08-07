# 11 — Authentication

Every authentication surface in the product, documented against the code as it
stands. Each screen is described by route, purpose, user flow, fields, buttons,
validation, business rules, API calls, and its error / success / loading / empty
states plus permissions.

**Nothing in this document is aspirational.** Anything not built is named as such
rather than described as if it existed.

Every gap the first pass found has since been closed: the screens it listed as
missing — Account Locked, Session Expired and the 500 error — are now built, and
the Terms and Privacy pages exist. §11 records what is still outstanding, and
[§17](#17-remaining-product-decisions) the two items blocked on a product or
content decision rather than on code.

---

## 1. Coverage

| # | Screen | Status | Where |
|---|---|---|---|
| 1 | Create Account | Implemented | `/create-account` — [§4](#4-create-account) |
| 2 | Verify Email | Implemented | `/verify` (pending view) — [§5](#5-verify-email) |
| 3 | Login | Implemented | `/login` — [§3](#3-login) |
| 4 | Forgot Password | Implemented | `/forgot-password` (form view) — [§6](#6-forgot-password) |
| 5 | Reset Password | Implemented | `/reset-password` (form view) — [§7](#7-reset-password) |
| 6 | Email Verified | Implemented | `/verify` (`done` view) — [§5.2](#52-email-verified-done-view) |
| 7 | Verification Link Expired | Implemented | `/verify` (`expired` view) — [§5.3](#53-verification-link-expired-expired-view) |
| 8 | Invalid Token | Implemented | `/reset-password` (invalid-link view) — [§7.3](#73-invalid-token-no-token-view) |
| 9 | Password Changed | Implemented | `/reset-password` (`done` view) — [§7.2](#72-password-changed-done-view) |
| 10 | Account Locked | Implemented | `/login` (locked view) — [§11](#11-account-locked) |
| 11 | 401 Unauthorized | **No screen** — redirect, or Session Expired | [§16.1](#161-401-unauthorized) |
| 12 | 403 Forbidden | Implemented | `/permission-denied` — [§8](#8-403-forbidden--permission-denied) |
| 13 | 404 Not Found | Implemented | no route; engine fallback — [§9](#9-404-not-found) |
| 14 | 500 Error | Implemented | no route; error boundary — [§12](#12-500-error) |
| 15 | Logout | Implemented as an **action**, not a screen | [§10](#10-logout) |
| 16 | Session Expired | Implemented | no route; rendered above the tree — [§13](#13-session-expired) |

Supporting screens outside the sixteen: **Terms of Service** (`/terms`) and
**Privacy Policy** (`/privacy`), linked from the sign-up consent checkbox —
[§14](#14-terms-and-privacy).

Five auth routes carry ten distinct rendered states, because Sign In, Verify
Email, Forgot Password and Reset Password each switch view in place rather than
navigating.

---

## 2. Shared foundations

### 2.1 Routes

All five auth routes are declared in
[`packages/configurations/src/routes.ts`](../packages/configurations/src/routes.ts)
and share `layout: "Auth.Layout"`. **None declares a `guard` or an `access`
rule** — every auth screen is public.

| Route id | Path | Page configuration | Component id |
|---|---|---|---|
| `Auth.Login.Route` | `/login` | `Auth.Login.Configuration` | `Auth.Login.Component` |
| `Auth.CreateAccount.Route` | `/create-account` | `Auth.CreateAccount.Configuration` | `Auth.CreateAccount.Component` |
| `Auth.ForgotPassword.Route` | `/forgot-password` | `Auth.ForgotPassword.Configuration` | `Auth.ForgotPassword.Component` |
| `Auth.ResetPassword.Route` | `/reset-password` | `Auth.ResetPassword.Configuration` | `Auth.ResetPassword.Component` |
| `Auth.VerifyEmail.Route` | `/verify` | `Auth.VerifyEmail.Configuration` | `Auth.VerifyEmail.Component` |
| `Recruit.PermissionDenied.Route` | `/permission-denied` | `Recruit.PermissionDenied.Page` | `Recruit.PermissionDenied.Component` |

`Auth.Layout` (`template: "custom"`) is just `Auth.Backdrop.Component` plus the
outlet. The two post-auth onboarding routes, `Recruit.GetStarted.Route`
(`/get-started`) and `Recruit.Setup.Route` (`/setup`), also use `Auth.Layout`
but **are** guarded by `authenticationGuard`.

### 2.2 Session and token flow

1. `AuthProvider` (`packages/recruit-sdk/src/providers/auth-provider.tsx`) wraps
   the whole tree and calls Better Auth's `useSession()`.
2. Until the session resolves it renders `BrandLoaderScreen` — a **global loading
   state that gates every screen in the app, auth screens included**.
3. Once resolved it calls `setAuthToken(session.token)`.
4. `httpClient` (`packages/recruit-sdk/src/client.ts`) attaches
   `Authorization: Bearer <token>` on every request via a request interceptor.
5. A response interceptor watches for the opposite: a `401` on a request that
   *did* carry a token means the session died mid-visit, and it fires the handler
   `AuthProvider` registered — see [§13](#13-session-expired). A 401 with no
   token is an ordinary unauthenticated call and is ignored, so a public screen
   never throws the user out.
6. Server-side, `getServerSession()` (`apps/web/src/access.ts`) forwards the
   request cookies to `GET {API_URL}/api/auth/get-session`.
7. `next.config.ts` in `apps/web` rewrites `/api/auth/:path*` to the API so the
   Better Auth cookie stays same-origin.

Better Auth is configured in [`apps/api/src/auth.ts`](../apps/api/src/auth.ts):
Drizzle adapter, `emailAndPassword.enabled: true`, the `bearer()` plugin, and
additional user fields `role` (default `"admin"`), `agencyId`, `status` (default
`"active"`, `input: false`), `phone`, `timezone`.

### 2.3 Form behaviour common to every auth form

All five forms render through `FormRenderer`
(`packages/shared/src/components/forms/form-renderer/form-renderer.tsx`), which
means uniformly:

- **Validation** is JSON-schema driven (ajv + react-hook-form), declared in each
  screen's `*.configuration.ts`. Messages are translation keys.
- **Loading state**: the submit button binds
  `loading={loading || formState.isSubmitting}`, so it shows a spinner for as
  long as the screen's `onSubmit` promise is pending.
- **Error state is not automatic** — `handleSubmit` re-throws a rejected
  `onSubmit`, so each screen must catch its own failures. All five do: Login,
  Create Account, Forgot Password and Reset Password render an
  `<Alert severity="error">` above the form, cleared on the next `onInput`;
  Verify Email renders its own tinted `role="alert"` box.
- There is a `ToastProvider` in `apps/web/src/app/providers.tsx`, but it is
  opt-in through `useToast()` and **no auth screen uses it**.

### 2.4 API surface

`apps/api/src/routes/auth.routes.ts` covers register / verify / forgot / reset.
Sign-in, sign-out and session are owned by Better Auth under `/api/auth/*`.

| Method | Path | Body / query | Handler |
|---|---|---|---|
| POST | `/auth/register` | `{ fullName, agency, email, password }` | `auth.controller.register` |
| POST | `/auth/verify/send` | `{ email }` | `sendVerificationCode` |
| POST | `/auth/verify/confirm` | `{ email, code }` | `confirmVerificationCode` |
| GET | `/auth/verify/link` | `?token` | `confirmVerificationLink` |
| POST | `/auth/forgot-password` | `{ email }` | `forgotPassword` |
| POST | `/auth/reset-password` | `{ token, password }` | `resetPassword` |
| POST | `/api/auth/sign-in/email` | Better Auth | — |
| POST | `/api/auth/sign-out` | Better Auth | — |
| GET | `/api/auth/get-session` | Better Auth | — |

Elysia validates each body against the route's `t.Object` schema before the
controller runs, so a malformed payload returns a validation error, not a 500.

### 2.5 API-side guards

`apps/api/src/plugins/auth-guard.ts` exposes three macros:

| Macro | Behaviour |
|---|---|
| `isAuth` | No session → `401 "Unauthorized"`. Otherwise exposes `ctx.user` / `ctx.session`. |
| `isVerified` | No session → 401. Session but `emailVerified === false` → `403 { code: "email-unverified", message: … }`. |
| `requireRole(role)` | No session → 401. Wrong `user.role` → `403 "Requires <role> role"`. |

`isVerified` is applied to the create/mutate routes of applications, candidates,
clients, contacts and jobs — this is what makes email verification mandatory
rather than cosmetic.

---

## 3. Login

### Route
`/login` · `Auth.Login.Route` · page `Auth.Login.Configuration` · component
`Auth.Login.Component`
(`packages/modules/recruit-auth/src/sign-in/sign-in.component.tsx`, delegating to
the shared `SignIn`).

### Purpose
Authenticate an existing user with email + password and land them on the
dashboard.

### User flow
1. User opens `/login` (directly, or via `authenticationGuard` redirecting from a
   guarded route).
2. Enters email and password; optionally toggles "Keep me signed in".
3. Submits → `signIn.email({ email, password, rememberMe })`.
4. On success → `router.push("Recruit.Root")` → `/`.
5. On failure → a generic error alert; the form stays put.

### Fields

| Field | Type | Widget | Required | Notes |
|---|---|---|---|---|
| `email` | string | text, `icon: "mail"` | not enforced client-side | label `email.label`, placeholder `email.placeholder` |
| `password` | string | `format: "password"`, `icon: "lock"` | not enforced client-side | label `password.label` |
| `rememberMe` | boolean | custom checkbox in `beforeSubmit` | — | **Component state, not in the schema.** Defaults to `true`. |

### Buttons

| Control | Action |
|---|---|
| Submit (label `submit` = "Sign in", `submitIcon: "arrow-forward"`) | Calls `signIn.email` |
| "Forgot password?" link | → `Auth.ForgotPassword.Route` |
| "Keep me signed in" toggle | Flips local `remember` state (`aria-pressed`) |
| Footer "Start your 14-day free trial" | → `Auth.CreateAccount.Route` |

### Validation
**None.** `sign-in.configuration.ts` declares no `required` array and no
`format`, with the explicit comment: *"No validation on the login screen — fields
submit as-is and the API decides."* The `email.errors.*` and `password.errors.*`
keys exist in the translations but are unreachable from this schema.

The subtitle is *"Use the work account your HirePilotX workspace was created
with."* It previously claimed two-factor authentication was required; there is no
2FA in this build, so the claim was removed rather than the feature invented.

### Business rules
- One generic failure message for any credential error — the component comment
  states this is deliberate so as not to reveal which field was wrong.
- **Five failures inside fifteen minutes lock the address.** The next attempt is
  refused before the password is checked — see [§11](#11-account-locked).
- Every sign-in attempt, success **or** failure, is recorded by the `logSignIn`
  Better Auth after-hook (`apps/api/src/auth.ts`):
  - `recordLogin({ organizationId, userId, email, userAgent, ip, result })`
  - an audit-log entry in the `security` category; on failure the event text is
    `"Login failed for <email> — wrong password"` with `Browser` / `Device`
    details parsed from the user agent.
  - A failed attempt has no session, so the account is resolved by email in order
    to still attribute the failure. Logging never throws — a logging failure must
    not block sign-in.
- IP is taken from the first entry of `x-forwarded-for`.

### API calls
`signIn.email()` from the Better Auth React client → `POST /api/auth/sign-in/email`
(proxied through the web origin so the cookie is same-origin).

### Error states
- Any credential failure → `t("errors.invalid")` — *"Incorrect email or password.
  Please try again."* — rendered as `<Alert severity="error">` above the form.
- The alert clears on the next `onInput` anywhere in the form (`onClearError`).
- A `403` carrying `code: "ACCOUNT_LOCKED"` is handled separately: the whole form
  is replaced by the locked view ([§11](#11-account-locked)) rather than an alert,
  because there is nothing worth submitting until the countdown runs out.
- No distinct state for an unverified account — verification is enforced when the
  user tries to create something, not at the sign-in door.

### Success states
No success screen — immediate navigation to `Recruit.Root` (`/`).

### Loading states
Submit button spins while `signIn.email` is in flight (`formState.isSubmitting`).
Before that, `AuthProvider` may still be showing `BrandLoaderScreen`.

### Empty states
Not applicable.

### Permissions
Public. No guard, no access rule.

---

## 4. Create Account

### Route
`/create-account` · `Auth.CreateAccount.Route` · component
`Auth.CreateAccount.Component` → shared `SignUp`.

### Purpose
Self-serve signup that provisions the user, their organization, their membership
and their CRM contact record in one call, then hands off to verification.

### User flow
1. User fills first name, last name, agency name, work email, password.
2. Ticks the terms consent checkbox.
3. Submits → `POST /auth/register`.
4. On success → `router.pushPath("/verify?email=<urlencoded email>")`. The code
   comment marks this explicitly: *"§5.1.2 — verification, not the login screen,
   is what follows sign-up."*

### Fields

| Field | Type | Constraints | Grid |
|---|---|---|---|
| `firstName` | string | required, `minLength: 2`, `maxLength: 50`, `icon: "person"` | `xs:12 sm:6` |
| `lastName` | string | required, `minLength: 2`, `maxLength: 50`, `icon: "person"` | `xs:12 sm:6` |
| `agency` | string | required, `minLength: 2`, `maxLength: 50`, `icon: "domain"` | 12 |
| `email` | string | required, `format: "email"`, `icon: "mail"` | 12 |
| `password` | string | required, `format: "password"`, `minLength: 8`, `strengthMeter: true`, `icon: "lock"` | 12 |
| consent | boolean | **Component state, not schema.** Gates submit. | — |

`gridContainer` is `{ columns: 12, spacing: "16px" }` so the two name fields pair
on one row.

### Buttons

| Control | Action |
|---|---|
| Submit ("Create account", `submitIcon: "arrow-forward"`) | Validates, checks consent, then `mutation.create` |
| Consent checkbox | Toggles `accepted`, clears `showConsentError` |
| "Terms of Service" / "Privacy Policy" links | `href: "#"` — **placeholders, not real destinations** |
| Footer "Sign in" | → `Auth.Login.Route` |

### Validation
- Schema: all five fields required with per-field `errorMessage` keys; length
  bounds on the three text fields; RFC email format; 8-character minimum password
  with a live strength meter.
- Consent is validated outside the schema: submitting without it sets
  `showConsentError`, renders `terms.required` ("You must accept the terms to
  continue") with `role="alert"`, tints the checkbox border `surface.errorFg`,
  and **returns without calling the API**.

### Business rules
`registerAccount` (`apps/api/src/services/auth.service.ts`) runs in a fixed order,
documented in the source: the User is created first so a duplicate email fails
before any organization is made.

1. **User** via `auth.api.signUpEmail` (Better Auth owns credentials + hashing).
2. **Organization** created, or associated if one already exists, via
   `provisionSignup`.
3. **Membership** — Owner for the first user of that org, otherwise Recruiter.
4. **Contact** — the CRM person record linked back to the User.
5. `user.agencyId` is set to the organization id and `user.role` to `"admin"`,
   denormalised so the session carries tenant + permission role without a lookup.
6. `seedAgencyPermissions(organization.id)`.
7. `seedAgencyTemplates(organization.id)` — must run before the first email,
   because transactional senders resolve templates by key.
8. The first verification code is sent with `{ initial: true }`, so it bypasses
   the resend cooldown. **A mail failure is caught and logged, never fails the
   registration** — the verify screen's resend covers it.

The two names are joined into a single `fullName` in the component
(`` `${firstName} ${lastName}`.trim() ``) because the account carries one name.

### API calls
`POST /auth/register` with `{ fullName, agency, email, password }` via
`signUpDatasource`. Returns `201` with
`{ id, email, name, organizationId, organizationRole }`.

### Error states
- **API**: a duplicate email produces `409 "Email already registered"` (matched by
  `/exist|already/i` against the Better Auth message). Any other error rethrows.
- **Screen**: two distinct errors.
  - Consent not ticked → `terms.required` inline under the checkbox, `role="alert"`,
    checkbox border tinted `surface.errorFg`. **The API is not called.**
  - A rejected `mutation.create` → `<Alert severity="error">` above the form,
    cleared on the next `onInput`. The component branches on the HTTP status:
    `409` renders `errors.emailTaken` ("That email already has an account. Sign in
    instead, or use a different work email."); anything else renders
    `errors.generic`. Navigation to `/verify` only happens after the mutation
    resolves.

### Success states
No success screen — redirect to `/verify?email=…`.

### Loading states
Submit button spinner for the duration of `POST /auth/register` (which includes
org provisioning, permission seeding, template seeding and the first email).

### Empty states
Not applicable.

### Permissions
Public.

---

## 5. Verify Email

One route, three views, selected by the `view` state in
`packages/shared/src/components/auth/verify-email.tsx`.

### Route
`/verify` · `Auth.VerifyEmail.Route`. Query parameters:
- `email` — carried over from sign-up, used for copy and for `confirm`/`resend`.
- `token` — present only when arriving from the magic link.

### Purpose
§5.1.2 mandatory email verification. Six-digit code plus a magic-link
alternative, a live expiry countdown, and a rate-limited resend.

> The component carries an explicit note: **there is deliberately no skip
> control** — TC-AUTH-004 asserts one does not exist anywhere on this screen.

### 5.1 Pending view (`data-testid="verify-pending"`)

#### User flow
1. Arrive from sign-up with `?email=`.
2. Either type the 6-digit code, or click the link in the email (which loads
   `/verify?token=…` and verifies without typing).
3. Submit → `POST /auth/verify/confirm`.
4. Success → `done` view. `expired` error code → `expired` view. Anything else →
   inline error, stay put.

#### Fields

| Field | Type | Constraints |
|---|---|---|
| `code` | string | required, `widget: "verification-code"`, `hideLabel: true`, `minLength: 6`, `maxLength: 6`, `pattern: "^[0-9]{6}$"` |

#### Buttons

| Control | Action |
|---|---|
| Submit (`cta` = "Verify email") | `handlers.confirm(code)` |
| "Send the code again" text action | `handlers.resend()`. Disabled while `cooldown > 0` or `sending`. Label becomes `resendIn` ("Send again in {{seconds}}s") during cooldown, and `resent` ("Code sent again ({{count}})") after at least one resend. |
| "Use a different email" link | → `Auth.CreateAccount.Route`. The config comments why: the address they need to change is the one they just registered with, so it goes back to sign-up, not login. |
| Footer "Sign in as someone else" | → `Auth.Login.Route` |

#### Validation
`required` → `code.errors.required`; `pattern` / `minLength` / `maxLength` all map
to `code.errors.format` ("That code should be 6 digits").

#### Business rules
Enforced in `apps/api/src/services/email-verification.service.ts`:

| Rule | Value |
|---|---|
| Code and link TTL | 30 minutes (`TTL_MS`) |
| Resend cooldown | 60 s (`RESEND_COOLDOWN_MS`) |
| Sends per hour | 5 (`MAX_SENDS_PER_HOUR`), rolling from `hourStartedAt` |
| Wrong attempts per row | 5 (`MAX_ATTEMPTS`), then the row is deleted and a resend is required |
| Code format | 6 digits, `Math.random`-derived |

- Issuing a new code **deletes any live row first**, so the previous code stops
  working immediately.
- Rate limits live in the service, not the route, because the initial send and a
  resend are the same operation and must share one counter. The initial send
  passes `{ initial: true }` and skips the cooldown/cap checks.
- An unknown address throws `unknown-email`, which the controller converts to
  `{ data: { sent: true } }` — **the endpoint must not disclose which addresses
  have accounts**.
- An already-verified account returns `{ data: { verified: true } }` rather than
  an error.
- Success marks `user.emailVerified = true` and deletes the verification row.
- The magic link is single-use: `confirmToken` deletes the row on success, so a
  second click reports `invalid` ("This link has already been used").

#### API calls
All three go through `verifyEmailDatasource`, which multiplexes on an `action`
field because `create` is the only mutation the engine exposes.

| Action | Call |
|---|---|
| `send` | `POST /auth/verify/send { email }` |
| `confirm` | `POST /auth/verify/confirm { email, code }` |
| `confirmLink` | `GET /auth/verify/link?token=…` |

The datasource unwraps the controller's `{ data }` envelope and, on failure,
rejects with `{ code, retryAfter }` taken from the response body.

#### Error states

| API code | HTTP | Rendered as |
|---|---|---|
| `invalid` | 400 | `errors.invalid` — "That code didn't match. Check the latest email — older codes stop working." |
| `expired` | 410 | **Switches to the `expired` view**, not an inline message |
| `too-many-attempts` | 429 | `errors.too-many-attempts` — "Too many attempts. Request a new code to continue." |
| `cooldown` | 429 + `retryAfter` | `errors.cooldown`; the cooldown timer is set from `retryAfter` |
| `hourly-cap` | 429 | `errors.hourly-cap` — "Too many codes requested this hour. Try again later." |

Rendered in a tinted box with `role="alert"` and
`data-testid="verify-error"`. Unknown codes fall back to `errors.invalid`.

#### Success states
`view` flips to `done` — [§5.2](#52-email-verified-done-view).

#### Loading states
- Submit spinner via `formState.isSubmitting`.
- `sending` disables the resend action while a resend is in flight.
- A `?token=` arrival verifies in a `useEffect` guarded by a `linkTried` ref so it
  fires once; **there is no loading indicator during that round trip** — the
  pending view is shown until it resolves.

#### Empty states
Not applicable.

#### Permissions
Public. The screen works from the emailed link with no session.

### 5.2 Email Verified (`done` view)

- **Testid** `verify-done`; `icon="mark-email-read"`, `tone="success"`.
- **Copy**: `done.title` "Email verified" / `done.subtitle` "Your workspace is
  live. Sign in and a short setup wizard will walk you through it."
- **Content**: a wizard preview tile (`done.wizardTitle` "Setup wizard · about 3
  minutes", `done.wizardBody` describing the five steps) — the design previews the
  wizard so a five-step form isn't a surprise on the other side of sign-in — plus
  `done.note`.
- **Button**: "Go to setup" (`done.cta`, `data-testid="verify-continue"`,
  `endIcon: arrow-forward`) wrapping a `LinkRenderer` to
  `Recruit.GetStarted.Route` (`/get-started`, which is guarded by
  `authenticationGuard`).
- **Reached from**: a successful `confirm`, a successful `confirmLink`, or an
  `already-verified` response.

### 5.3 Verification Link Expired (`expired` view)

- **Testid** `verify-expired`; `icon="link-off"`, `tone="error"`.
- **Copy**: `expired.title` "This link has expired" / `expired.subtitle`
  "Verification links last 30 minutes. Send a fresh one to **{{email}}** and it
  arrives in a few seconds." The email is bolded in place by the `emphasise`
  helper.
- **Button**: "Send a fresh link" (`expired.cta`,
  `data-testid="verify-resend-fresh"`), `loading={sending}`,
  `disabled={cooldown > 0}`; during cooldown the label becomes
  `resendIn` ("Send again in {{seconds}}s"). A successful resend returns the
  screen to the `pending` view with a reset 30-minute timer and a 60-second
  cooldown.
- **Note**: `expired.note` — "Your workspace and any invites you already sent are
  untouched — only this link stopped working."
- **Reached from**: a `confirmLink` that rejects or resolves false, or a `confirm`
  that returns the `expired` code.

### 5.4 The countdown

`TTL_SECONDS = 30 * 60`, decremented by a 1-second interval that also drives the
resend cooldown. Formatted `m:ss` (the design shows "29:42", then "5:03"), and
interpolated into the subtitle as `{{clock}}`.

**This countdown is client-side only.** It starts at 30:00 on mount and resets on
reload, so it is a display of the code's nominal lifetime, not of the actual
server-side expiry. The authoritative check is `row.expiresAt` in
`confirmCode` / `confirmToken`.

---

## 6. Forgot Password

### Route
`/forgot-password` · `Auth.ForgotPassword.Route` · shared `ForgotPassword`.

### Purpose
Request a single-use password-reset link by email.

### 6.1 Form view (`data-testid="forgot-form"`)

#### User flow
Enter the work email → submit → the same screen switches to the "sent"
confirmation. No navigation.

#### Fields

| Field | Type | Constraints |
|---|---|---|
| `email` | string | required (`email.errors.required`), `format: "email"` (`email.errors.format`), `icon: "mail"` |

#### Buttons
- Submit — "Send reset link" (`submit`), `submitIcon: "send"`.
- Footer "Back to sign in" → `Auth.Login.Route`.

#### Validation
Required + RFC email format, both with dedicated messages.

#### Business rules
- `requestPasswordReset` calls `auth.api.requestPasswordReset` with
  `redirectTo: ${WEB_ORIGIN}/reset-password`.
- The controller **always** returns `{ ok: true }`. The source comment is
  explicit: *"Always resolves so the endpoint never reveals which addresses have
  accounts."*
- The mail itself is sent by Better Auth's `sendResetPassword` callback in
  `apps/api/src/auth.ts`, using the agency's `forgot` template.

#### API calls
`POST /auth/forgot-password { email }` via `forgotPasswordDatasource`.

#### Error states
The endpoint always succeeds for a request that lands, so the only failure mode is
a transport error. That renders `errors.generic` ("We couldn't send the link just
now. Check your connection and try again.") as an `<Alert severity="error">` above
the form, cleared on the next `onInput`. The view only switches to "sent" after
`onSubmit` resolves, so a failed request never shows a false confirmation. The
same alert covers a failed resend on the sent view.

#### Success states
Switches to the sent view ([§6.2](#62-sent-view)).

#### Loading states
Submit-button spinner while the request is in flight.

#### Empty states
Not applicable.

#### Permissions
Public.

#### Note shown on the form
`note` — "The link works once and expires after 30 minutes. If you didn't ask for
it, no action is needed — your password stays as it is." (See
[§13.2](#132-reset-link-expiry-is-stated-three-different-ways).)

### 6.2 Sent view

- **Testid** `forgot-sent`; `icon="mark-email-read"`, `tone="success"`.
- **Copy**: `sent.title` "Check your inbox" / `sent.subtitle` "We sent a reset link
  to **{{email}}**. It expires in 30 minutes and can only be used once." The
  address is bolded in place.
- **Actions**:
  - "Send the link again" — re-submits the same email. Disabled while
    `cooldown > 0`; label becomes `sent.resendIn` during cooldown.
  - "Use a different email" — clears `sentEmail` and the cooldown, returning to
    the form view.
- **Cooldown**: `RESEND_COOLDOWN = 60` seconds, **client-side only**. The comment
  notes it mirrors the API's throttle rather than leaving a button that silently
  does nothing; the API endpoint itself always returns `ok`.

---

## 7. Reset Password

One route, three views, selected in
`packages/shared/src/components/auth/reset-password.tsx`. The component is
wrapped in `<Suspense>` because it reads `useSearchParams()`.

### Route
`/reset-password?token=<token>` · `Auth.ResetPassword.Route`.

### 7.1 Form view (`data-testid="reset-form"`)

#### Purpose
Set a new password using the token from the emailed link.

#### User flow
Arrive from the email link with `?token=` → enter and confirm a new password →
submit → the same screen switches to the success view.

#### Fields

| Field | Type | Constraints |
|---|---|---|
| `password` | string | required, `format: "password"`, `minLength: 8`, `strengthMeter: true`, `icon: "lock"` |
| `confirmPassword` | string | required, `format: "password"`, `matchesField: "password"`, `icon: "lock-reset"` |

#### Buttons
- Submit — "Save new password" (`submit`).
- Footer "Back to sign in" → `Auth.Login.Route`.

#### Validation
Required on both; 8-character minimum on `password`; `matchesField` cross-field
equality producing `confirmPassword.errors.matches` — "Both passwords need to
match."

#### Business rules
- The token comes from the query string and is submitted alongside the password.
- `resetPassword` calls `auth.api.resetPassword({ token, newPassword })`; Better
  Auth owns token validation and hashing.
- **Token lifetime is 30 minutes** — `RESET_TOKEN_TTL_SECONDS` in
  `apps/api/src/auth.ts`, passed to `emailAndPassword.resetPasswordTokenExpiresIn`.
  The same constant supplies the email's `expiry_minutes`, so the configured TTL,
  the email and the screen copy cannot drift apart.
- **Every other session is revoked** — `revokeSessionsOnPasswordReset: true`.
  Better Auth leaves this off by default; it is on here because the success screen
  states it.
- **The reset is written to the audit log** — the `onPasswordReset` hook records a
  `security`-category entry (`"<name> reset their password"`) against the user's
  organization. The reset endpoint is unauthenticated, so this hook is the only
  place that knows which account it was.

#### API calls
`POST /auth/reset-password { token, password }` via `resetPasswordDatasource`.
Returns `{ ok: true }`, or `400 "Invalid or expired reset link"` if Better Auth
rejects the token.

#### Error states
The component branches on the HTTP status:

- **`400`** — the token was expired, already spent, or malformed. This sets
  `tokenRejected`, which switches the screen to the invalid-link view
  ([§7.3](#73-invalid-token-no-token-view)). A dead token and a missing token now
  reach the same state, which is the one that tells the user what to do next.
- **Anything else** — `errors.generic` ("We couldn't save the new password just
  now. Please try again.") as an `<Alert severity="error">` above the form,
  cleared on the next `onInput`.

`setDone(true)` runs only after `onSubmit` resolves, so a failure never shows the
success screen.

#### Success states
Switches to the success view ([§7.2](#72-password-changed-done-view)).

#### Loading states
Submit-button spinner during the request.

#### Empty states
Not applicable.

#### Permissions
Public — possession of the token is the authorisation.

### 7.2 Password Changed (`done` view)

- **Testid** `reset-done`; `icon="check-circle"`, `tone="success"`.
- **Copy**: `success.title` "Password updated" / `success.subtitle` "Sign in with
  the new password. Every other session was signed out just now."
- **Summary rows** (`AuthSummary`), because the design reports exactly what
  happened rather than a bare "done":
  - "Sessions ended" → "All other devices"
  - "Logged to" → "Workspace audit log"
- **Button**: "Go to sign in" (`success.cta`, `endIcon: arrow-forward`) →
  `router.push(links.signIn.routeId)`.
- Both summary rows are now backed by configuration —
  `revokeSessionsOnPasswordReset` and the `onPasswordReset` audit hook. The screen
  previously asserted both while the service did neither.

### 7.3 Invalid Token (no-token view)

- **Testid** `reset-invalid`; `icon="link-off"`, `tone="error"`.
- **Trigger**: either the `token` query parameter is **absent** (the link was
  truncated in the mail client), or the API answered `400` for the token that was
  submitted (it expired, was already spent, or a newer link superseded it).
- **Copy**: `invalidState.title` "This link isn't valid" / `invalidState.subtitle`
  explaining truncation or supersession.
- **Reassurance list** (each with a check icon):
  - "Your account is unchanged and still secure."
  - "Your current password still works, if you remember it."
- **Button**: "Send a fresh link" (`invalidState.cta`) → `Auth.ForgotPassword.Route`.

---

## 8. 403 Forbidden — Permission Denied

### Route
`/permission-denied` · `Recruit.PermissionDenied.Route` · layout
`Recruit.Bare.Layout` · page `Recruit.PermissionDenied.Page` · component
`Recruit.PermissionDenied.Component`
(`packages/modules/recruit-core/src/permission-denied/`).

### Purpose
Tell a signed-in user that their **role** does not include the permission for the
page they tried to open.

### User flow
1. The engine resolves the route's `access` rule against `accessResolver()`.
2. On denial the engine calls `onAccessDenied()` (`apps/web/src/access.ts`), which
   is `redirect("/permission-denied")`.
3. The user reads the message and either requests access or goes back.

### Fields
None.

### Buttons

| Control | Action |
|---|---|
| Primary — "Back to my dashboard" | `router.push(config.homeRouteId)` (`Recruit.Root`) |

The screen previously led with a "Request access" button that only set local
React state — nothing was sent, stored or notified, while the follow-up copy read
*"Request sent — you'll be notified when access changes."* Since no request
backend exists, the button and its copy were removed rather than faked, and the
subtitle now names the real remedy: *"A workspace admin can grant it in Settings →
Roles & permissions."* Restoring the button is a matter of building an endpoint
for it.

### Validation
Not applicable.

### Business rules
- Access resolution reads the Better Auth session, normalises `user.role`

  through `normaliseRole` — the comment notes a live session may still carry a
  role string this build renamed, and without normalisation those users resolve
  to an empty permission map and every gated element silently disappears — and
  looks the role up in `ROLE_PERMISSIONS`.
- `accessResolver` also supplies `dashboardVariant` (presentation only),
  `agencyId` and `userId`.
- The screen is purely informational — it performs no write of its own.

### API calls
None from this screen. `accessResolver` itself calls
`GET {API_URL}/api/auth/get-session` server-side.

### Error states
This screen *is* the error state. `errorLine`: "Error code: 403 · Need help?
Contact your admin".

### Success states
None — the screen has a single state.

### Loading states
None — it renders no data of its own.

### Empty states
Not applicable.

### Permissions
Reachable by any signed-in user; it is the destination *for* a permission
failure.

---

## 9. 404 Not Found

### Route
**No route** — a 404 has no path of its own, and redirecting to one would throw
away the URL the user actually typed. `createPortalApp` instead substitutes a
page configuration when the slug matches nothing, so the screen renders **in
place** with the original URL intact.

### Purpose
Terminal state for an unmatched URL.

### User flow
1. User opens an unknown path.
2. `findRouteBySlug` misses, so `generateRenderTree` yields a tree with no page.
3. `createPortalApp` swaps in the configuration registered as
   **`Recruit.NotFound.Page`**, as `{ layouts: [], page: fallback, slots: {} }`.
4. From there the normal pipeline runs — dependency collection, translation
   resolution, `PortalRenderer` — so the screen behaves like any other page.
5. If no such configuration is registered, `PortalRenderer` still falls back to
   the SDK's built-in `<NotFound />`, which keeps the SDK usable standalone.

### Fields
None.

### Buttons

| Control | Target |
|---|---|
| Primary — "Back to Dashboard" | `router.push(config.homeRouteId)` → `Recruit.Root` |

The screen previously carried a second "Help Center" button pointing at
`href: "/help"`, which no route serves — clicking it re-rendered the 404. It was
removed along with the two other dangling Help Center entries; see
[§15.1](#151-the-nav-still-points-at-ten-unbuilt-screens).

### Validation / Business rules
Copy lives in `not-found.translations.json` like every other screen — it used to
be hardcoded English inside the SDK component, which is why it was the one screen
that could not be translated.

- `title`: "The pilot left this page"
- `subtitle`: "It was moved, renamed, or never took off. Check the link — or fly
  back to somewhere that exists."
- `errorLine`: "Error code: 404"

Implemented as `Recruit.NotFound.Component`
(`packages/modules/recruit-core/src/not-found/`), wired to
`Recruit.NotFound.Page` in `pages/core.ts`. The SDK knows only the page id, so it
stays app-agnostic. A regression test asserts both the page and the component are
registered, because a rename would silently downgrade the screen to the built-in.

### API calls
None.

### Error / Success / Loading / Empty states
This screen is itself the error state; it has no substates.

### Permissions
Public. It renders for an unmatched path without running guards — an unmatched
slug produces no matched routes, so there are no guards to run.

---

## 10. Logout

**Logout is an action, not a screen.** There is no `/logout` route and no
confirmation or goodbye screen.

### Where it lives
The avatar menu in the core appbar
(`packages/modules/recruit-core/src/appbar/appbar.configuration.ts`), as the sole
item of the final menu section:

```ts
{ label: "menu.logout", icon: "logout", action: "logout", danger: true }
```

`menu.logout` resolves to **"Sign out"**. The appbar component dispatches on the
action string: `if (item.action === "logout") logout()`.

### Behaviour
`useLogout()` (`packages/recruit-sdk/src/providers/auth-provider.tsx`):

1. `setAuthToken(undefined)` — clears the in-memory bearer token.
2. `authClient.signOut()` → `POST /api/auth/sign-out`.
3. In `.finally()` — so it happens whether or not sign-out succeeded —
   `window.location.href = process.env.NEXT_PUBLIC_LOGOUT_CALLBACK_URL || "/login"`.

The full page load is deliberate: it drops the in-memory SWR cache for free.

### Related
`Settings → Security` has a separate "Sign out all sessions" control
(`packages/modules/recruit-settings/src/security/security.component.tsx`), which
is a different operation from this menu item.

### Permissions
Available to any signed-in user; the appbar only renders inside
`Recruit.Core.Layout`, which sits behind `authenticationGuard`.

---

## 11. Account Locked

### Route
`/login` · a view of `Auth.Login.Route`, not a route of its own. It needs the
address that was refused, and a route would either lose that or put it in a URL.

### Purpose
Stops an account accepting sign-ins after repeated wrong passwords, and tells the
user how long it will be before they can try again.

### User flow
1. Five sign-ins for the same address fail inside fifteen minutes.
2. The next attempt is refused *before the password is checked*, so a locked
   account cannot be probed.
3. The form is replaced by the locked view: a countdown, an explanation, and a
   link to reset the password instead.
4. When the countdown reaches zero the form returns on its own — nothing to
   reload, no unlock request.

### Fields
None. The locked view has no form, so there is nothing to submit while it stands.

### Buttons

| Control | Action |
|---|---|
| "Reset my password instead" | → `Auth.ForgotPassword.Route` |
| Footer "Start your 14-day free trial" | → `Auth.CreateAccount.Route` |

### Validation
Not applicable.

### Business rules

Implemented in `apps/api/src/services/lockout.service.ts` and enforced by the
`guardLockout` before-hook in `apps/api/src/auth.ts`.

| Rule | Value |
|---|---|
| Failures before the lock | 5 (`MAX_FAILED_ATTEMPTS`) |
| Window | 15 minutes (`LOCKOUT_MINUTES`) |
| Scope | Per email address |

The lock is **derived from the existing login history**, not stored. No counter
column, no `lockedUntil`, no unlock job — three rules over the rows the platform
already writes for every attempt:

- **It is a sliding window.** The account is shut while five failures sit inside
  the last fifteen minutes, and it opens again as they age out. The wait reported
  to the user is the time until the *oldest* of those five leaves the window,
  because that is the moment the count drops below five. For the usual burst of
  wrong passwords in quick succession that is the full fifteen minutes.
- **A success forgives what came before it.** Counting stops at the most recent
  successful sign-in, so yesterday's fumbles never contribute.
- **Refusals are recorded as `blocked`, not `failed`, and only `failed` counts.**
  Without that split, someone hammering a locked account would keep re-arming
  their own lock and never get back in. The `blocked` rows are excluded in SQL
  rather than merely ignored, so a burst of retries cannot push the failures that
  justify the lock out of the query's row limit.

Every refusal still writes a login-history row and, when the address resolves to
a workspace, an audit entry — `"Sign-in blocked for <email> — account temporarily
locked"`, `security` category, `failure` severity, with browser and device. The
record-keeping is wrapped so that a logging failure can never decide whether
someone gets in.

### API calls
None from the screen. The refusal arrives as the response to the ordinary
sign-in call: `403` with `code: "ACCOUNT_LOCKED"` and `retryAfter` in seconds.

### Error states
This view *is* the error state for repeated failures. Nothing on it can fail.

If the API refuses without saying how long, the screen falls back to fifteen
minutes rather than showing a countdown it cannot honour.

### Success states
The countdown reaching zero. `onLockExpired` clears the lock and the sign-in form
comes back in place.

### Loading states
None — no request is in flight while the view is up.

### Empty states
Not applicable.

### Permissions
Public, like the rest of the sign-in screen.

---

## 12. 500 Error

### Route
**No route.** Rendered by the Next.js error boundaries in
`apps/web/src/app/error.tsx` (a page or component threw) and
`global-error.tsx` (the root layout itself threw).

### Purpose
Catches an unexpected failure and says so plainly, instead of leaving the user on
a blank or half-rendered page.

### User flow
1. Something throws during render.
2. The boundary catches it and logs it to the console.
3. The screen offers to retry the render, or to leave for the dashboard.

### Fields
None.

### Buttons

| Control | Action |
|---|---|
| Primary — "Try again" | Next's `reset()` — re-renders the segment that failed |
| Secondary — "Back to Dashboard" | `href: "/"` |

### Validation / Business rules

Copy lives in `server-error.translations.json` and is imported statically rather
than resolved through `useTranslation`. This is deliberate: whatever failed may
include the engine that resolves translations, and a crash screen that depends on
the systems that just crashed is a crash screen that sometimes fails to appear.
The text still lives outside the component; it just cannot follow the user's
language.

`global-error.tsx` replaces the root layout, so it brings its own `<html>` and
its own `ThemeModeProvider`. Nothing in it touches the session or the engine.

- Headline: "That one's on us"
- Subtitle: "Something broke on our side, not yours. Nothing you were working on
  has been lost — try again, and if it keeps happening let support know."
- `errorLine`: "Error code: 500"

### API calls
None.

### Error / Success / Loading / Empty states
The screen is itself the error state. "Try again" either recovers, or the
boundary catches again and the same screen returns.

### Permissions
Public — it renders wherever the failure happened, signed in or not.

---

## 13. Session Expired

### Route
**No route.** Rendered by `AuthProvider` above the whole tree, so it replaces
whatever screen the user was on.

### Purpose
Tells a user whose session ended mid-visit what happened, instead of leaving
half-loaded data on screen looking live.

### User flow
1. The user is working; their session ends — it lapsed, or a password change
   revoked it.
2. The next request carrying the session token comes back `401`.
3. The response interceptor fires the handler `AuthProvider` registered.
4. The Session Expired screen replaces the page — once, not per failed request.
5. "Sign in again" runs the ordinary logout path, clearing the stale token before
   returning to Sign In.

### Fields
None.

### Buttons

| Control | Action |
|---|---|
| Primary — "Sign in again" | `useLogout()` — clears the token, signs out, redirects to Sign In |

### Validation
Not applicable.

### Business rules
- Only a `401` **on a request that carried a token** counts. A 401 with no token
  is an ordinary unauthenticated call — a public screen, or a race before the
  session resolves — and is ignored, so nobody is thrown out of a screen they
  were entitled to see.
- The screen is rendered above the tree rather than redirected to, so the user
  sees an explanation instead of arriving at Sign In with no idea why.
- Copy is a static import, for the same reason as the 500 screen: by the time
  this renders the session is gone, and a screen that depends on resolved
  dependencies is a screen that can fail to appear.

### API calls
None of its own. It is triggered by the failure of whatever call the screen was
making.

### Error / Success / Loading / Empty states
The screen is the error state; "Sign in again" leaves it. It has no substates.

### Permissions
Only reachable while signed in — an unauthenticated user has no token for the
interceptor to notice.

---

## 14. Terms and Privacy

### Routes
`/terms` · `Recruit.Terms.Route` and `/privacy` · `Recruit.Privacy.Route`, both
on `Recruit.Bare.Layout`, both public and unguarded — the sign-up screen links to
them before an account exists.

### Purpose
Gives the consent checkbox on Create Account something real to point at.

### User flow
User clicks "Terms of Service" or "Privacy Policy" from the sign-up consent line
(or from the small print below it) → reads → "Back to sign up" returns them to
Create Account.

### Fields
None.

### Buttons

| Control | Action |
|---|---|
| "Back to sign up" | → `Auth.CreateAccount.Route` |

### Validation
Not applicable.

### Business rules
Both documents render through one component, `LegalDocument`
(`packages/shared/src/components/legal/`), bound twice with different
translations — Terms and Privacy differ only in their words, so they share the
renderer rather than duplicating a layout. Section count comes from each
document's configuration, which reads it off its own translation file.

`draft: true` in both configurations renders a warning band stating the text has
not been through a lawyer. Dropping the flag removes the band; see
[§17.1](#171-the-legal-text-is-a-draft).

### API calls
None.

### Error / Success / Loading / Empty states
Static documents — none.

### Permissions
Public.

---

## 15. Outstanding

Everything the first pass flagged has since been built or fixed. What remains is
a single content dependency and one product decision:

| Item | State |
|---|---|
| Terms and Privacy carry placeholder wording | **Open** — pages exist and are linked; the text needs legal review. See [§17.1](#171-the-legal-text-is-a-draft) |
| The 403 screen no longer offers to request access | **Open** — see [§17.2](#172-the-403-screen-no-longer-offers-to-request-access) |
| Ten nav entries point at unbuilt screens | **Open** — outside this module, see [§15.1](#151-the-nav-still-points-at-ten-unbuilt-screens) |

### 15.1 The nav still points at ten unbuilt screens

`configurations.test.ts` walks every configuration and every component's default
configuration, collects each `routeId`, and checks it against the real route ids.
It found eleven dangling.

One was a genuine typo, now fixed: the sidenav's Audit Log item pointed at
`Recruit.AuditLog.Route` while the screen has always been
`Recruit.SettingsAuditLog.Route`, so a shipped screen was unreachable from the
nav.

The other ten name screens that do not exist at all:

`Recruit.AiScreening.Route` · `Recruit.Analytics.Route` ·
`Recruit.Automation.Route` · `Recruit.Commissions.Route` ·
`Recruit.Interviews.Route` · `Recruit.Messages.Route` ·
`Recruit.Notifications.Route` · `Recruit.Pipeline.Route` ·
`Recruit.Placements.Route` · `Recruit.TeamActivity.Route`

They sit in an `UNBUILT_ROUTES` allowlist in the test rather than being deleted
from the nav, because whether those entries should disappear or their screens
should get built is a product call. The assertion still fails on any *new*
dangling id; delete each entry as its route lands.

This is outside the authentication scope; it is recorded here because the audit
that found it started here.

---

## 16. Screens not implemented

One remains.

### 16.1 401 Unauthorized

There is still no screen showing "401", and there does not need to be — the two
ways a request can be unauthorised now both have a real destination:

- **Not signed in, opening a guarded page**: `authenticationGuard` redirects to
  Sign In before anything renders.
- **Signed in, but the session died under the user**: the response interceptor
  catches the 401 and the Session Expired screen replaces the page
  ([§10](#10-session-expired)).

What is left is the API's bare `401 "Unauthorized"` body, which no longer reaches
the user as a raw status.

---

## 17. Remaining product decisions

### 17.1 The legal text is a draft

`/terms` and `/privacy` exist, are linked from the consent checkbox, and describe
what the product actually does — but the wording has not been through a lawyer.
Both pages render a warning band saying so, driven by `draft: true` in their
configuration.

The content was written to be accurate rather than authoritative: it states how
workspaces, roles, verification, retention and sub-processors actually behave in
this build, so it is a useful starting point for counsel rather than boilerplate
that contradicts the software. Replace the wording, then drop the `draft` flag —
that removes the band without any other change.

### 17.2 The 403 screen no longer offers to request access

Removing the fake "Request access" button ([§8](#8-403-forbidden--permission-denied))
closed a false promise, but it also removed the only in-product path for a
blocked user to signal that they need a permission. The subtitle now directs them
to a workspace admin instead. If self-serve access requests are wanted, they need
an endpoint, a store and a notification — at which point the button can come back
with the copy it originally had.

---

## 18. Source map

| Concern | File |
|---|---|
| Route tree | `packages/configurations/src/routes.ts` |
| Page configurations | `packages/configurations/src/pages/auth.ts`, `pages/core.ts` |
| Layout | `packages/configurations/src/layouts/index.ts` (`Auth.Layout`) |
| Feature modules | `packages/modules/recruit-auth/src/{sign-in,sign-up,verify-email,forgot-password,reset-password,backdrop}/` |
| Shared screen components | `packages/shared/src/components/auth/` |
| Permission Denied | `packages/modules/recruit-core/src/permission-denied/` |
| 404 | `packages/recruit-sdk/src/not-found.tsx`, `error-screen.tsx` |
| 500 | `packages/recruit-sdk/src/server-error.tsx`, `apps/web/src/app/error.tsx`, `global-error.tsx` |
| Session Expired | `packages/recruit-sdk/src/session-expired.tsx`, `client.ts` (response interceptor) |
| Account lockout | `apps/api/src/services/lockout.service.ts` (+ `lockout.test.ts`), `guardLockout` in `apps/api/src/auth.ts`, locked view in `packages/shared/src/components/auth/sign-in.tsx` |
| Terms / Privacy | `packages/shared/src/components/legal/`, `packages/modules/recruit-core/src/legal/` |
| Session / token | `packages/recruit-sdk/src/providers/auth-provider.tsx`, `client.ts` |
| Logout action | `auth-provider.tsx` (`useLogout`), `recruit-core/src/appbar/` |
| Web guards / access | `apps/web/src/guards.ts`, `apps/web/src/access.ts` |
| Better Auth config | `apps/api/src/auth.ts` |
| API routes | `apps/api/src/routes/auth.routes.ts` |
| API controller | `apps/api/src/controllers/auth.controller.ts` |
| Registration / reset services | `apps/api/src/services/auth.service.ts` |
| Verification service | `apps/api/src/services/email-verification.service.ts` |
| API guards | `apps/api/src/plugins/auth-guard.ts` |
