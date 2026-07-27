# Module 35 - Security, Sessions, API Tokens & Audit Log

> **Open question:** `doc/00-Glossary-and-Conventions.md` and
> `doc/01-Introduction-System-Overview.md` were not present in the repository when this
> chapter was written. Every enum below is sourced from the Settings and Profile Settings
> designs or from the implemented `security` / `audit` services; none of them restate
> pipeline stages, SLA numbers, currency or ID formats. Where this chapter needs a value
> that belongs to Module 00 it refers to Module 00 by section rather than repeating it.
> This chapter must be re-checked against Module 00 once that file exists.

---

# 1. Overview

This module specifies everything that answers the question *"who did what, from where, with
what credential, and may they still do it?"*

It covers four related but separately governed surfaces:

| Surface | Owner | Scope | Gate |
|---|---|---|---|
| **Workspace security** | The workspace | Policies binding on every member: MFA enforcement, password policy, session timeout, allowed email domains, SSO/SAML | `security.manage` |
| **Account security** | The individual user | Their own password, two-factor, recovery codes, device sessions, sign-in history | Authentication only — never permission-gated |
| **API tokens** | The individual user, scoped to one workspace | Machine credentials that act on the API without a browser session | `integrations.manageApi` to create; the owning user may always revoke their own |
| **Audit log** | The workspace | The immutable record of every consequential action in every module | `audit.view` |

Two rules run through the whole module:

1. **The audit log is the system of record, not a convenience feature.** Every other module
   writes to it; no module reads from it to make a decision. Nothing in the product may
   delete or edit an audit event.
2. **A workspace policy always outranks a personal preference.** If the workspace requires
   MFA, a member cannot disable their own two-factor. If the workspace sets a session
   timeout, a member cannot extend it.

Related modules: Module 00 §3 (pipeline stages, referenced by audit events that carry a
stage), Module 19 (submissions), Module 24 (placements and invoices), Module 25
(commissions).

---

# 2. Where each surface lives

- **Workspace security** and the **audit log** are tabs of the workspace Settings screen.
  The audit log is a separate tab from security and is described in the design as
  *"admin only"*; it carries an **Enterprise** plan badge.
- **Account security** is a tab of the personal account screen, reached from the user's own
  avatar. It is never reachable from workspace Settings, and no administrator can open
  another member's account security tab.
- Administrators act on another member's credentials only through the Members list — a
  **Reset password** row action that sends a reset link. They never see or set a password.

**Rule.** A tab the user lacks the permission for is not rendered. The tab strip narrows;
the layout does not change and no "no access" placeholder is shown. A member holding a
read-only variant of a permission sees the tab with a **Read-only** badge and every control
disabled.

---

# 3. Workspace security policies

## 3.1 Fields

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `requireMfa` | boolean | Yes | Default `false`. When `true`, every member must complete two-factor enrolment. |
| `passwordPolicy.minLength` | integer | Yes | Default `12`. Range 8–64. |
| `passwordPolicy.requireMixedCase` | boolean | Yes | Default `true`. |
| `passwordPolicy.requireNumber` | boolean | Yes | Default `true`. |
| `passwordPolicy.requireSymbol` | boolean | Yes | Default `false`. |
| `passwordPolicy.expiryDays` | integer | No | Null = passwords never expire. PROPOSED — needs product sign-off. |
| `sessionTimeout` | enum | Yes | See §3.4. Default `30d`. |
| `allowedEmailDomains` | string[] | No | Empty = no restriction. Lower-cased, stored without the `@`. |
| `sso.enabled` | boolean | Yes | Default `false`. Enterprise plan only. |
| `sso.provider` | enum | No | Required when `sso.enabled`. See §3.6. |
| `sso.domain` | string | No | Required when `sso.enabled`. One verified domain. |
| `sso.enforced` | boolean | No | When `true`, password sign-in is refused for members on the SSO domain. |
| `securityNotifications` | object | Yes | Four booleans, see §3.8. |
| `alertRecipients` | string[] | No | Extra addresses that receive security alerts. |

## 3.2 The security score

The Security tab opens with a single workspace security score and a list of checks.

**Rules.**

- The score is a percentage, `0`–`100`, recomputed hourly and on any change to a policy,
  member or token. It is presentational: nothing in the product blocks on it.
- Each check is either **passing** or **failing**. A failing check states the count that
  makes it fail and links to the screen that fixes it.
- The score is the weighted proportion of passing checks. PROPOSED weighting — needs
  product sign-off:

| Check | Machine key | Passes when | Weight |
|---|---|---|---|
| MFA coverage | `mfa_coverage` | Every active member has two-factor enabled | 30 |
| Password strength | `password_strength` | No member's password is below the workspace policy | 25 |
| Token hygiene | `token_hygiene` | No API token is expired, and none is older than 365 days | 15 |
| SSO readiness | `sso_ready` | SSO is configured, or the plan does not offer it | 10 |
| Dormant accounts | `dormant_accounts` | No active member has been inactive for 30+ days | 10 |
| Session timeout | `session_timeout` | `sessionTimeout` is 30 days or shorter | 10 |

- A check that cannot be evaluated (for example `sso_ready` on a plan without SSO) counts as
  passing and its weight stays in the denominator.

> **Open question:** the Settings design shows a workspace score of **82%** with four checks
> (`4 members without MFA`, `12 weak passwords`, `1 expired API token`, `SSO ready`), while
> the implemented account-level service returns **92** without two-factor and **100** with
> it, over three checks. These are two different scores — a workspace score and a personal
> "your account is protected" summary — that have been conflated. This chapter treats them
> as separate: the workspace score is specified above; the account summary in §4 is a
> three-state banner with no number.

## 3.3 MFA enforcement

| Rule | Behaviour |
|---|---|
| Turning enforcement on | Existing sessions are **not** killed. Every member without two-factor is forced into enrolment at their next sign-in and cannot reach any other screen until enrolled. |
| Enrolment grace | PROPOSED: no grace period — enrolment is immediate at next sign-in. Needs product sign-off. |
| Coverage display | The control states how many members have not yet enrolled, in the form "*n* of *m* haven't yet". |
| Turning enforcement off | Members keep their two-factor unless they individually disable it. |
| Interaction with the account tab | While enforcement is on, a member's **Disable** action on their own two-factor is refused with the reason "workspace policy requires two-factor". |
| Client contacts | Enforcement applies to workspace members. Whether it extends to client-portal contacts is an open question (§11). |
| Audit | Both directions write `security.mfa_policy_changed`. |

## 3.4 Session timeout

Members are signed out after this much **inactivity**.

| Machine value | Display label |
|---|---|
| `7d` | 7 days |
| `14d` | 14 days |
| `30d` | 30 days |
| `90d` | 90 days |

**Rules.**

- Default `30d`.
- The timeout is idle-based: any authenticated request refreshes the session's last-seen
  time. There is no separate absolute maximum lifetime. PROPOSED — needs product sign-off.
- Changing the value applies to existing sessions immediately; it does not sign anyone out
  at the moment of the change.
- The confirmation states the consequence in full: members are signed out after *n* of
  inactivity.
- Audit: `security.session_timeout_changed`, with the previous and new value.

## 3.5 Allowed email domains

**Rules.**

- The list restricts **invitations only**. It never blocks an existing member from signing
  in, and it never applies to client-portal contacts.
- An empty list means no restriction.
- A domain is stored lower-cased, without a leading `@` and without a scheme or path. It
  must contain at least one dot.
- Adding a duplicate is a no-op, not an error.
- Removing the last domain returns the workspace to unrestricted, and the confirmation must
  say so.
- Invite validation runs per address: an invite of several addresses where some fail is
  rejected as a whole and names the offending addresses.
- Audit: `security.email_domain_added` / `security.email_domain_removed`.

## 3.6 SSO / SAML

Enterprise plan only. On lower plans the block is visible but inert, with an upgrade path
and a preview mode that shows the configured state without applying it.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `provider` | enum | Yes | `okta` (Okta), `azure_ad` (Microsoft Entra ID / Azure AD), `google_workspace` (Google Workspace) |
| `protocol` | enum | Yes | `saml2` (SAML 2.0). Only value at present. |
| `domain` | string | Yes | The email domain the connection covers. Must be verified before the connection can be enforced. |
| `entityId` / `acsUrl` / `certificate` | string | Yes | Supplied by the identity provider. Never displayed after save; the certificate is shown by fingerprint only. |
| `enforced` | boolean | Yes | When `true`, password sign-in is refused for addresses on `domain`. |
| `usersSynced` | integer | Read-only | Count of members provisioned through the connection. |
| `lastSyncAt` | timestamp | Read-only | Displayed relative ("15 minutes ago"). |

**Rules.**

- Enforcing SSO does not delete existing passwords; it stops them being accepted. Turning
  enforcement off restores password sign-in without a reset.
- The workspace owner is always exempt from `enforced`, so a broken identity provider can
  never lock the workspace out. PROPOSED — needs product sign-off.
- Enabling, disabling, reconfiguring or enforcing SSO each write a separate audit event and
  each fire the `sso` security notification (§3.8), regardless of who made the change.

## 3.7 Security insights

Four counters, refreshed hourly, each linking to the screen that resolves it.

| Insight | Machine key | Counts | Links to |
|---|---|---|---|
| Members without MFA | `members_without_mfa` | Active members with two-factor disabled | Members list, filtered |
| Inactive 30+ days | `inactive_members` | Active members with no sign-in in 30 days | Members list, filtered |
| Failed logins (24h) | `failed_logins_24h` | `login_history` rows with result `failed` or `blocked` in the last 24 hours | Audit log, filtered to `security` |
| Expired API token | `expired_tokens` | Tokens past `expiresAt` and not yet revoked | The token list |

Insights are counts over live data, never a stored snapshot. A zero-count insight is still
shown, in its passing state.

## 3.8 Security notifications and alert recipients

The workspace emails the account owner, plus any additional alert recipients, when a
selected event occurs.

| Machine key | Display label | Fires on |
|---|---|---|
| `notify_new_device` | A new device signs in | A session is created from a device fingerprint not seen for that user before |
| `notify_password_change` | The password changes | Any member's password changes, including via reset |
| `notify_two_factor_disabled` | Two-factor is disabled | Any member turns their own two-factor off |
| `notify_sso_change` | SSO configuration changes | Any change to the SSO block in §3.6 |

**Rules.**

- All four default to **on**.
- The account owner's address is always a recipient and cannot be removed; it is shown with
  an **Owner** tag and no remove control.
- Additional recipients are plain email addresses. They are not required to be members, and
  adding one does not grant any access.
- A recipient address receives alerts only; it never receives an invitation and never
  appears in the Members list.
- Adding or removing a recipient is itself audited (`security.alert_recipient_added` /
  `security.alert_recipient_removed`).

---

# 4. Account security

Personal, and therefore gated on authentication only. Every authenticated user — including
a client contact — reaches their own account security tab.

The tab opens with a three-state protection banner. It carries no score.

| State | Machine value | Shown when |
|---|---|---|
| Protected | `protected` | Password meets policy, two-factor on, login alerts on |
| Attention | `attention` | Any one of the above is not satisfied |
| At risk | `at_risk` | Password below policy **and** two-factor off |

## 4.1 Password

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `currentPassword` | string | Yes | Required for a self-service change. Not required when arriving from a reset link. |
| `newPassword` | string | Yes | Must satisfy the workspace policy in §3.1. |
| `confirmPassword` | string | Yes | Must equal `newPassword`. |
| `passwordChangedAt` | timestamp | Read-only | Displayed as an absolute date, with a strength label. |

**Rules.**

- A strength meter is shown while typing. It is advisory: the **only** blocking rule is the
  workspace policy. Strength bands are `none`, `weak`, `fair`, `good`, `strong`.
- The device performing the change **stays** signed in. All of the user's other sessions are
  revoked. The dialog must state this before submission.
- A password change writes `security.password_changed` and fires the
  `notify_password_change` alert.
- A password **reset** completed from an emailed link revokes **every** session, including
  the one that requested it.
- Administrators trigger a reset link; they never set a password. Doing so writes
  `security.password_reset_requested` with both the actor and the subject member.

> **Open question:** the Settings design's change-password dialog advises "8+ characters"
> while the workspace policy control states a minimum of 12 and the account dialog advises
> "12+". The policy value in §3.1 is authoritative; the advisory copy must be derived from
> it rather than hard-coded.

## 4.2 Two-factor and recovery codes

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `twoFactorEnabled` | boolean | Yes | Default `false`. |
| `twoFactorMethod` | enum | No | `authenticator` (authenticator app). Only value at present; SMS is explicitly out of scope. |
| `twoFactorEnabledAt` | timestamp | No | Set on successful verification, cleared on disable. |
| `recoveryCodes` | string[] | No | Exactly 10 codes, generated together. |
| `recoveryCodesGeneratedAt` | timestamp | No | Displayed with an unused count ("8 of 10 unused"). |

**Rules.**

- Enrolment is not complete until one code from the authenticator has been verified.
  Enabling without verification is not a state the system can be in.
- Recovery codes are generated at enrolment and shown **once**. They are stored hashed and
  can never be re-displayed — only regenerated.
- Each recovery code works exactly once.
- Regenerating invalidates the entire previous set immediately. The confirmation must say
  so.
- Disabling two-factor destroys the recovery codes, writes
  `security.two_factor_disabled`, and fires the `notify_two_factor_disabled` alert.
- Disabling is refused while the workspace requires MFA (§3.3).

## 4.3 Device sessions

One row per live session for the signed-in user.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `id` | string | Yes | Opaque. Never the session token. |
| `device` | string | Yes | Derived from the user agent, e.g. "MacBook Pro", "iPhone 15". Falls back to "Unknown device". |
| `browser` | string | Yes | e.g. "Chrome 139". Falls back to "Unknown browser". |
| `os` | string | Yes | e.g. "macOS 15.6". Falls back to "Unknown OS". |
| `location` | string | No | Coarse location derived from the IP. Falls back to "Unknown location". |
| `ip` | string | No | Recorded even when location cannot be derived. |
| `createdAt` | timestamp | Yes | First sign-in on this device. |
| `lastSeenAt` | timestamp | Yes | Displayed relative; the current session displays "Active now". |
| `isCurrent` | boolean | Yes | Exactly one session per request is current. |

Session badges:

| Machine value | Display label | Meaning |
|---|---|---|
| `current` | Current | The session making the request |
| `trusted` | Trusted | Seen for more than 24 hours without a security event |
| `new` | New | Created within the last 24 hours |
| `mobile` | Mobile | Device class is a phone or tablet |

**Rules.**

- The current session sorts first. The remainder sort by `lastSeenAt`, most recent first.
- **Revoke** signs that device out immediately; the next request from it is unauthenticated.
  A confirmation names the device and browser and states that the user will need to sign in
  again.
- The current session cannot be revoked from this list — signing out is the sign-out action.
- **Sign out other sessions** revokes every session except the current one, in one
  operation, and reports how many were ended. It is the recommended follow-up to a password
  change.
- Revoking a session does **not** revoke API tokens; the two credential types are
  independent (§5).
- Audit: `security.session_revoked` (with the device) and
  `security.all_sessions_revoked` (with the count).

## 4.4 Login history

Sign-in **attempts**, deliberately separate from active sessions: a row here survives
sign-out, and failures never produce a session at all.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `id` | string | Yes | Opaque. |
| `email` | string | Yes | The address attempted, even when no user matches it. |
| `userId` | string | No | Null when the address matches no account. Set to null, not deleted, if the user is later removed. |
| `organizationId` | string | No | Null when the address matches no workspace. |
| `browser` | string | No | Parsed from the user agent. |
| `os` | string | No | Parsed from the user agent. |
| `location` | string | No | Coarse location from the IP. |
| `ip` | string | No | |
| `result` | enum | Yes | See below. |
| `createdAt` | timestamp | Yes | |

| `result` | Display label | Meaning |
|---|---|---|
| `success` | Success | Credentials accepted and a session was created |
| `failed` | Failed | Credentials rejected — wrong password, unknown address, or failed second factor |
| `blocked` | Blocked | Credentials were not evaluated — the account was locked, the IP was rate-limited, or the address failed an SSO or domain rule |

**Rules.**

- The list is filterable by result: **All**, **Success**, **Failed**, **Blocked**.
- A user sees only their own attempts. Attempts against an address with no account are
  visible only in the workspace audit log, and only when the address belongs to a member.
- The default page shows the 25 most recent attempts, newest first.
- Lock-out: PROPOSED — three consecutive `failed` attempts against the same address lock it
  for 15 minutes, and the lock itself is recorded as `blocked`. Needs product sign-off; the
  design shows a "3rd attempt" failure with the note "Account locked for 15 min".
- Login history is retained for the same 12 months as the audit log (§6.5).

---

# 5. API tokens

A **personal access token** authenticates API calls without a browser session. It belongs to
one user and one workspace, and carries that user's permissions.

## 5.1 Fields

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `id` | string | Yes | Opaque. |
| `name` | string | Yes | 1–60 characters. Free text; must be unique per user per workspace. Defaults to "New token" if blank. |
| `prefix` | string | Yes | The leading characters of the secret, kept for display, e.g. `hpx_pat_9f2K…`. |
| `secret` | string | Yes | Format `hpx_pat_<random>`. **Returned exactly once, at creation.** Only a hash is stored. |
| `scopes` | string[] | Yes | See §5.2. At least one. |
| `userId` | string | Yes | The acting identity for every call made with the token. |
| `organizationId` | string | Yes | The workspace the token is confined to. |
| `createdAt` | timestamp | Yes | |
| `lastUsedAt` | timestamp | No | Null until first use; displayed as "Never". |
| `expiresAt` | timestamp | No | Null = never expires. Default 90 days from creation. |
| `revokedAt` | timestamp | No | Set on revocation. The row is never deleted. |

Derived status:

| Machine value | Display label | Meaning |
|---|---|---|
| `active` | Active | Not revoked, not past `expiresAt` |
| `expiring` | Expires in *n* days | Active, with `expiresAt` inside 14 days |
| `expired` | Expired | Past `expiresAt`, not revoked |
| `revoked` | Revoked | `revokedAt` set |

## 5.2 Scopes

PROPOSED — the designs show tokens without a scope picker. Needs product sign-off.

| Scope | Grants |
|---|---|
| `candidates.read` / `candidates.write` | Read or create/update candidates and CVs |
| `jobs.read` / `jobs.write` | Read or create/update jobs |
| `clients.read` / `clients.write` | Read or create/update clients and contacts |
| `submissions.read` / `submissions.write` | Read or create submissions (Module 19) |
| `placements.read` | Read placements and invoices (Module 24) |
| `analytics.read` | Read aggregate reporting |
| `webhooks.manage` | Register and remove webhook endpoints |

**Rules.**

- A token's effective permission is the **intersection** of its scopes and the owning user's
  role permissions at the time of the call. Losing a permission immediately narrows every
  token that user holds; it does not revoke the token.
- Scopes cannot be edited after creation. Changing scope means creating a new token and
  revoking the old one.
- A token never grants `submissions.approve` — that capability is client-only and is not
  reachable through the API.
- A token never carries impersonation.

## 5.3 Creation, rotation and revocation

**Creation**

- Requires `integrations.manageApi`.
- The plaintext secret is displayed once, in a dialog that warns that anyone holding the
  token can act as the workspace, and that it cannot be shown again.
- Closing the dialog without copying is not recoverable — the only remedy is to revoke and
  create another.
- Audit: `security.api_token_created`, recording the token name and expiry, never the
  secret or its hash.

**Rotation**

- Rotation is create-then-revoke, not an in-place secret change: a token's secret is
  immutable. This is deliberate — it gives the integration owner an overlap window.
- The system warns 14 days before `expiresAt` via the `expiring` status and the token
  hygiene check (§3.2); an expired token surfaces as a failing security insight.
- PROPOSED: a token unused for 180 days is flagged in the security insights but not
  auto-revoked. Needs product sign-off.

**Revocation**

- Any of: the owning user, a holder of `integrations.manageApi`, or the workspace owner.
- Revocation takes effect on the next request; there is no grace period.
- A revoked token's row is retained so that historical audit events remain attributable.
  Revoked tokens are hidden from the default list.
- Removing a member revokes every token they own, in the same operation.
- Audit: `security.api_token_revoked`, with the token name and who revoked it.

> **Open question:** neither the workspace Settings design nor the account Profile Settings
> design renders a token list, yet both compute one, the workspace security insights count
> expired tokens, and a "Token created" dialog exists. The token list needs a home. PROPOSED:
> it belongs on the workspace Settings → Integrations tab (workspace-visible, gated on
> `integrations.manageApi`), with the owning user also seeing their own tokens on their
> account security tab. Needs product sign-off.

---

# 6. The audit log

## 6.1 Purpose and guarantees

- **Append-only.** No product surface creates an edit or delete path for an audit event.
- **Workspace-scoped.** Every event belongs to exactly one workspace and is never visible
  across workspaces.
- **Never client-visible.** A client contact must never see the audit log, whether or not
  the event concerns them. This is a query-level scope in the service layer, not a UI rule.
- **Written synchronously with the action it records.** If the action commits, the event
  commits. If writing the event fails, the action is not reported as successful.

## 6.2 Event schema

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `id` | string | Yes | Opaque, monotonically ordered. Not shown to users. |
| `organizationId` | string | Yes | The workspace. |
| `occurredAt` | timestamp | Yes | UTC. Rendered relative ("Today · 9:41 AM"), with the absolute timestamp on hover, in the workspace timezone. |
| `actorType` | enum | Yes | §6.3. |
| `actorId` | string | No | Member, contact or token id. Null for `anonymous` and `system`. |
| `actorLabel` | string | Yes | The name shown in the row. Snapshotted at write time so a later rename or removal does not rewrite history. |
| `onBehalfOfId` | string | No | Set only when `actorType` is `impersonation`: the user being impersonated. |
| `category` | enum | Yes | §6.4. |
| `action` | string | Yes | Dotted machine key, `<category>.<verb>`, e.g. `security.api_token_created`. Stable; never localised. |
| `severity` | enum | Yes | §6.5. |
| `summary` | string | Yes | One human-readable sentence, past tense, naming the actor and the object. |
| `objects` | array | No | Zero or more `{ key, label, id }` references — Candidate, Client, Job, Invoice, Token. Each is a filter shortcut in the UI. |
| `details` | object | No | Flat key/value pairs shown in the event drawer, e.g. `{ "Previous role": "Sourcer", "New role": "Recruiter" }`. |
| `payload` | object | No | The raw machine payload, shown as JSON in the drawer with a copy action. |
| `ip` | string | No | The caller's IP. `system` for scheduled and automation events; the provider name for third-party callbacks. |
| `userAgent` | string | No | Recorded, not displayed in the row. |

**Rules.**

- `summary` is generated at write time and stored, not rendered from a template at read
  time. History must not change when copy changes.
- `details` and `payload` must never contain a password, a token secret, a recovery code, or
  a full candidate CV. They may contain identifiers and counts.
- An event that concerns a candidate carries the candidate as an `objects` entry; where it
  also implies a pipeline stage, that stage must be one of the machine values defined in
  Module 00 §3 and must be recorded in `details` under the key `Stage`.

## 6.3 Actor types

| Machine value | Display label | Meaning |
|---|---|---|
| `member` | *the member's name* | A signed-in workspace member acting through the UI |
| `client_contact` | *the contact's name* (Client portal) | A client contact acting through the client portal |
| `automation` | Automation | A workspace automation or scheduled job. `ip` is `system`. |
| `api_token` | API | A call authenticated by a personal access token. `actorId` is the token id; the token name appears in `details`. |
| `impersonation` | *the operator's name* (as *the member's name*) | A support operator acting as a member. `onBehalfOfId` is mandatory. |
| `system` | System | Platform-initiated: billing renewals, provider callbacks, retention jobs |
| `anonymous` | Unknown | An unauthenticated actor — a failed sign-in, an unrecognised callback |

**Impersonation rules.**

- Impersonation is a support capability, not a workspace one. No workspace role can
  impersonate another member.
- Every impersonated action writes `actorType: impersonation` with **both** identities. The
  audit row must display both; showing only the impersonated member is a defect.
- Starting and ending an impersonation session are themselves events
  (`security.impersonation_started` / `security.impersonation_ended`), carrying a stated
  reason.
- Impersonation is read-mostly: PROPOSED — an impersonated session may not change billing,
  security policy, roles, or delete any record. Needs product sign-off.
- The workspace owner is notified by email whenever an impersonation session starts.

## 6.4 Categories

| Machine value | Display label | Covers |
|---|---|---|
| `permissions` | Permissions | Invitations, role changes, member removal, custom roles |
| `candidates` | Candidates | Candidate create/edit/delete, imports, exports, merges, screening |
| `client` | Client actions | Anything done by a client contact in the portal; client record changes |
| `jobs` | Requirements | Job create, publish, archive, delete |
| `billing` | Billing | Subscription, seats, invoices, payment attempts, AI credits |
| `system` | System | Automations, scheduled reports, AI runs, retention jobs |
| `security` | Security | Everything in §3, §4 and §5 |
| `integrations` | Integrations | Connect, disconnect, sync failures, expiring provider tokens |
| `email` | Email | Template changes and template-driven sends |

The filter offers an additional `all` value labelled **All**; it is a filter option, not a
stored category.

> **Open question:** the design labels the `jobs` category **Requirements** while the
> navigation calls the same entity **Jobs**. Module 00 must settle one term; this chapter
> quotes the design's machine value `jobs` and its display label, and does not choose.

## 6.5 Severity

| Machine value | Display label | Meaning |
|---|---|---|
| `success` | Success | The action completed as intended |
| `warning` | Warning | The action completed but needs attention — a bulk export, an expiring credential, a partial sync |
| `failure` | Failure | The action did not complete, or completed destructively — a failed sign-in, a declined charge, a deletion |

Severity is set by the writing module, never inferred at read time. A destructive but
intentional action (deleting a client, deleting a candidate) is `failure` severity because
the log's purpose is to make it findable, not to judge it.

## 6.6 Reading, searching and filtering

- Default order: `occurredAt` descending.
- Free-text search covers `actorLabel`, `summary`, `objects[].label` and `ip`.
- Filters: **user** (multi-select), **category** (multi-select), **result / severity**
  (multi-select), and **date range** (single-select).
- An `objects` chip in a row is a shortcut that filters the log to that object.
- Filters combine with AND across facets and OR within a facet. The active filter count is
  shown, with a single **Clear filters** action.
- The list is paginated. The footer states the visible range out of the filtered total, and
  restates the retention and export limits.
- Selecting a row opens a read-only drawer: the summary, the object references, the
  `details` rows and the raw `payload` with a copy action. Nothing in the drawer is editable.
- Empty state: "No events match" with guidance to change the search, user or date range.
  This is distinct from a workspace with no events at all.

## 6.7 Retention and export

| Rule | Value |
|---|---|
| Retention | **12 months**, then permanent deletion by a scheduled job |
| Export limit | **100,000 events** per export |
| Export formats | `csv`, `json` — PROPOSED, needs product sign-off (see below) |
| Export permission | `audit.view` |

**Rules.**

- Retention and the export limit are stated in the log footer at all times, not hidden in
  help.
- An export applies the **currently active filters**. Exporting with no filters exports the
  whole retained window, subject to the limit.
- An export that would exceed 100,000 events is refused before it starts, with the matched
  count and a prompt to narrow the date range. It is never silently truncated.
- Export is asynchronous above a threshold: the file is prepared and delivered as a
  download link to the requester. PROPOSED threshold 10,000 events — needs product sign-off.
- **Exporting the audit log is itself an audited event** (`security.audit_exported`,
  severity `warning`), recording the filters, the format and the row count.
- The retention job writes one `system.audit_retention_pruned` event per run, with the count
  deleted. That event is itself subject to retention.
- Retention is not configurable per workspace at present.

> **Open question:** the design's export menu offers a format list that is not defined
> anywhere in the screen, and elsewhere in Settings exports are offered as "CSV or PDF". PDF
> is a poor fit for an audit export. This chapter proposes CSV and JSON and excludes PDF.

---

# 7. Events every other module must write

Every module in this specification writes to the audit log. The table below is the minimum
contract: a module may write more, never fewer. `action` keys are stable machine values.

## 7.1 Workspace, members and roles

| Action | Category | Severity | Required objects / details |
|---|---|---|---|
| `permissions.member_invited` | `permissions` | `success` | Invited address, role, client access |
| `permissions.invitation_cancelled` | `permissions` | `warning` | Address |
| `permissions.member_role_changed` | `permissions` | `success` | Member; `Previous role`, `New role` |
| `permissions.member_suspended` / `permissions.member_reactivated` | `permissions` | `warning` / `success` | Member |
| `permissions.member_removed` | `permissions` | `failure` | Member; reassignment target for their records |
| `permissions.role_created` / `permissions.role_updated` / `permissions.role_deleted` | `permissions` | `success` / `success` / `failure` | Role name; changed permission keys |
| `permissions.client_access_changed` | `permissions` | `success` | Member; clients added and removed |
| `system.workspace_settings_changed` | `system` | `success` | Each changed field, with previous and new value |

## 7.2 Clients, contacts and jobs

| Action | Category | Severity | Required objects / details |
|---|---|---|---|
| `client.created` / `client.updated` | `client` | `success` | Client |
| `client.deleted` | `client` | `failure` | Client; count of jobs moved; recovery window |
| `client.contact_added` / `client.contact_removed` | `client` | `success` / `warning` | Client, contact |
| `client.portal_access_granted` / `client.portal_access_revoked` | `client` | `success` / `warning` | Client, contact |
| `jobs.created` / `jobs.updated` | `jobs` | `success` | Job, client |
| `jobs.published` | `jobs` | `success` | Job, client |
| `jobs.archived` | `jobs` | `success` | Job, client |
| `jobs.deleted` | `jobs` | `failure` | Job, client |

## 7.3 Candidates and the pipeline (Module 00 §3)

| Action | Category | Severity | Required objects / details |
|---|---|---|---|
| `candidates.created` | `candidates` | `success` | Candidate; source |
| `candidates.updated` | `candidates` | `success` | Candidate; changed fields |
| `candidates.deleted` | `candidates` | `failure` | Candidate; reason (mandatory when the reason is a data-subject request) |
| `candidates.merged` | `candidates` | `warning` | Surviving and merged candidates |
| `candidates.imported` | `candidates` | `success` | Row count, duplicate count, file name, duration |
| `candidates.exported` | `candidates` | `warning` | Row count, format, reason. **Always `warning`** — bulk export of personal data is always noteworthy |
| `candidates.stage_changed` | `candidates` | `success` | Candidate, job; `Stage` set to a Module 00 §3 machine value, plus the previous stage |
| `candidates.screened` | `system` | `success` | Candidate or job; model, credits used, match score |

## 7.4 Submissions (Module 19)

| Action | Category | Severity | Required objects / details |
|---|---|---|---|
| `submissions.submitted` | `candidates` | `success` | Candidate, client, job; match score, resulting stage |
| `submissions.withdrawn` | `candidates` | `warning` | Candidate, client, job; reason |
| `submissions.rejected` | `candidates` | `success` | Candidate, job; reason |
| `client.submission_approved` | `client` | `success` | Candidate, client. `actorType` is `client_contact` |
| `client.submission_rejected` | `client` | `success` | Candidate, client; reason. `actorType` is `client_contact` |
| `client.cv_downloaded` | `client` | `warning` | Candidate, client. `actorType` is `client_contact` |

## 7.5 Interviews, offers, placements and invoices (Module 24)

| Action | Category | Severity | Required objects / details |
|---|---|---|---|
| `candidates.interview_scheduled` / `candidates.interview_rescheduled` / `candidates.interview_cancelled` | `candidates` | `success` / `success` / `warning` | Candidate, job; time, participants |
| `candidates.feedback_recorded` | `candidates` | `success` | Candidate, job; outcome |
| `candidates.offer_created` / `candidates.offer_accepted` / `candidates.offer_declined` | `candidates` | `success` / `success` / `warning` | Candidate, job |
| `billing.placement_created` | `billing` | `success` | Candidate, client, job; fee basis and value |
| `billing.placement_amended` | `billing` | `warning` | Placement; changed fields with previous and new value |
| `billing.placement_cancelled` | `billing` | `failure` | Placement; reason |
| `billing.invoice_issued` | `billing` | `success` | Invoice, client; amount |
| `billing.invoice_paid` | `billing` | `success` | Invoice; amount, method |
| `billing.invoice_voided` | `billing` | `failure` | Invoice; reason |

## 7.6 Commissions (Module 25)

| Action | Category | Severity | Required objects / details |
|---|---|---|---|
| `billing.commission_calculated` | `billing` | `success` | Placement, member; rule applied, amount |
| `billing.commission_adjusted` | `billing` | `warning` | Placement, member; previous and new amount, reason (mandatory) |
| `billing.commission_approved` | `billing` | `success` | Member, period; total |
| `billing.commission_paid` | `billing` | `success` | Member, period; total, payment reference |
| `billing.commission_rule_changed` | `billing` | `warning` | Rule; previous and new definition, effective date |

## 7.7 Subscription and AI credits

| Action | Category | Severity | Required objects / details |
|---|---|---|---|
| `billing.plan_changed` | `billing` | `success` | Previous and new plan; effective date |
| `billing.seat_added` / `billing.seat_removed` | `billing` | `success` | Previous and new count; prorated amount |
| `billing.payment_failed` | `billing` | `failure` | Amount, reason, retry schedule. `actorType` is `system` |
| `billing.subscription_cancelled` | `billing` | `failure` | Access-until date; stated reason |
| `billing.credits_purchased` | `billing` | `success` | Credit count, amount |

## 7.8 Integrations, email and automations

| Action | Category | Severity | Required objects / details |
|---|---|---|---|
| `integrations.connected` / `integrations.disconnected` | `integrations` | `success` / `warning` | Provider, connected account |
| `integrations.reconnected` | `integrations` | `success` | Provider |
| `integrations.sync_failed` | `integrations` | `failure` | Provider; error summary |
| `integrations.credential_expiring` | `integrations` | `warning` | Provider; days remaining. `actorType` is `automation` |
| `integrations.webhook_created` / `integrations.webhook_deleted` | `integrations` | `success` / `warning` | Endpoint |
| `email.template_created` / `email.template_updated` / `email.template_deleted` | `email` | `success` / `success` / `warning` | Template; summary of the change |
| `email.bulk_send` | `email` | `warning` | Template, recipient count |
| `system.automation_run` | `system` | `success` or `failure` | Automation name; run count, failure count, duration |
| `system.report_delivered` | `system` | `success` | Report, recipients |

## 7.9 Security (this module)

| Action | Category | Severity |
|---|---|---|
| `security.login_succeeded` | `security` | `success` |
| `security.login_failed` | `security` | `failure` |
| `security.login_blocked` | `security` | `failure` |
| `security.login_new_device` | `security` | `warning` |
| `security.password_changed` | `security` | `success` |
| `security.password_reset_requested` | `security` | `success` |
| `security.two_factor_enabled` / `security.two_factor_disabled` | `security` | `success` / `warning` |
| `security.recovery_codes_regenerated` | `security` | `warning` |
| `security.session_revoked` / `security.all_sessions_revoked` | `security` | `warning` |
| `security.api_token_created` / `security.api_token_revoked` | `security` | `success` / `warning` |
| `security.mfa_policy_changed` | `security` | `success` |
| `security.password_policy_changed` | `security` | `success` |
| `security.session_timeout_changed` | `security` | `success` |
| `security.email_domain_added` / `security.email_domain_removed` | `security` | `success` / `warning` |
| `security.sso_enabled` / `security.sso_updated` / `security.sso_disabled` | `security` | `success` / `success` / `warning` |
| `security.alert_recipient_added` / `security.alert_recipient_removed` | `security` | `success` / `warning` |
| `security.impersonation_started` / `security.impersonation_ended` | `security` | `warning` |
| `security.audit_exported` | `security` | `warning` |
| `system.audit_retention_pruned` | `system` | `success` |

---

# 8. Permissions

| Capability | Permission key | Notes |
|---|---|---|
| View and edit workspace security policies | `security.manage` | Includes SSO/SAML |
| View workspace security, read-only | `security.view` | Tab renders with a **Read-only** badge; every control disabled |
| View and export the audit log | `audit.view` | Export requires the same key — there is no separate export permission |
| Create API tokens | `integrations.manageApi` | Revoking one's own token needs no permission |
| Own account security | *(none)* | Authentication only |

**Rules.**

- Never branch on a role name. Every gate above is a permission check.
- Permissions are not monotonic by seniority: a role holding `security.manage` does not
  thereby hold `audit.view`.
- Hiding a control is cosmetic. Every rule in this module is enforced server-side; the API
  is the boundary.
- Client contacts hold none of these keys, and the audit log, security tab and token list
  are excluded from client-scoped queries at the service layer, not merely hidden.

---

# 9. Validation and error handling

| Condition | Behaviour |
|---|---|
| Password below the workspace policy | Rejected with the specific unmet rule named, not a generic message |
| `confirmPassword` mismatch | Rejected before submission |
| Wrong current password | Rejected; counts towards the lock-out in §4.4 |
| Two-factor code wrong or expired | Rejected; enrolment state unchanged |
| Recovery code already used | Rejected as invalid; the number of unused codes is not disclosed at the sign-in screen |
| Disable two-factor while MFA is enforced | Refused, stating the workspace policy |
| Invite to a domain not in `allowedEmailDomains` | The whole invite is rejected, naming the offending addresses |
| Malformed domain (no dot, contains a scheme or path) | Rejected before save |
| Revoking an already-revoked token or session | Treated as a no-op success |
| Token name duplicate for the same user | Rejected |
| Export above the limit | Refused before starting, with the matched count |
| Audit event write failure | The originating action is not reported as successful |

---

# 10. Open questions

> **Open question:** does workspace MFA enforcement apply to client-portal contacts, or only
> to workspace members? The design's coverage counter counts members only.

> **Open question:** is there an enrolment grace period after MFA enforcement is switched on,
> or is enrolment forced at the very next sign-in? §3.3 assumes the latter.

> **Open question:** should the session timeout also carry an absolute maximum lifetime
> independent of activity? §3.4 assumes idle-only.

> **Open question:** where does the API token list live — workspace Settings → Integrations,
> the account security tab, or both? Neither design renders it. See §5.3.

> **Open question:** are API token scopes in scope for the first release, or does a token
> simply inherit its owner's permissions unscoped? §5.2 is a proposal.

> **Open question:** which export formats does the audit log offer? §6.7 proposes CSV and
> JSON and excludes PDF.

> **Open question:** is the 12-month audit retention fixed, or configurable per plan? An
> Enterprise-badged feature with a fixed window is unusual.

> **Open question:** the `jobs` category displays as **Requirements** while navigation uses
> **Jobs**. Module 00 must settle the term.

> **Open question:** the successor module title below is PROPOSED and needs confirming
> against the agreed module list.

---

Next: Module 36 - Integrations, Webhooks & the Public API
