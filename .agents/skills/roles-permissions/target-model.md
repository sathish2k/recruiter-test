# Target permission model

The agreed model for HirePilotX. **Not yet implemented** — see the migration
delta at the bottom for what the code does today.

Principle: **built-in roles are predefined permission sets, not hardcoded
checks.** Never branch on the role name; always check a permission key. That is
what lets enterprise customers add custom roles (Finance Manager, HR Manager,
Operations Lead) without a code change.

```ts
if (user.role === "owner")            // ✗ never
can({ resource: "billing", action: ["manage"] })   // ✓ always
```

## The five built-in roles

| Role | Purpose |
|---|---|
| **Owner** | Owns the subscription. Can do everything. Cannot be removed by other users. Transfers ownership. One per agency. |
| **Admin** | Runs the workspace — invites users, manages branding, jobs, candidates, templates, integrations. Cannot change ownership or payment details. |
| **Profile Lead** | Leads a recruiting team. Creates jobs, reviews recruiters' submissions, manages candidates. May invite recruiters if enabled. |
| **Recruiter** | Day-to-day recruiting — sources candidates, uploads resumes, runs AI matching, submits candidates, schedules interviews. |
| **Client** | Client portal only. Sees jobs assigned to them and candidates submitted to them; approves/rejects; schedules interviews; downloads resumes if allowed. |

**Client isolation is a hard boundary**, not a permission toggle. A client must
never see other clients, recruiters, billing, internal notes, or audit logs.
Enforce it as a query-level scope in the service layer, not as a UI rule.

## Legend

| Mark | Meaning |
|---|---|
| ✅ | Granted by default |
| ❌ | Never granted |
| **Optional** | Agency-configurable in the matrix; **default off** |
| **View** | Read-only variant of the capability |
| **Limited** | Scoped subset (client sees only their own records) |
| **Connect own** | May connect only their own account, not the workspace's |

## Matrix

### Workspace
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Edit workspace | `workspace.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Branding | `workspace.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Recruitment defaults | `workspace.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| ID prefixes | `workspace.managePrefixes` | ✅ | ❌ | ❌ | ❌ | ❌ |
| Report branding | `reports.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |

### Members
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| View members | `members.view` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invite members | `members.invite` | ✅ | ✅ | Optional | ❌ | ❌ |
| Remove members | `members.remove` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Reset password | `members.resetPassword` | ✅ | ✅ | ❌ | ❌ | ❌ |

### Roles & permissions
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Manage roles | `roles.manage` | ✅ | Optional | ❌ | ❌ | ❌ |
| Create custom roles | `roles.create` | ✅ | ❌ | ❌ | ❌ | ❌ |

### Jobs
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Create jobs | `jobs.create` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit jobs | `jobs.edit` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete jobs | `jobs.delete` | ✅ | ✅ | Optional | ❌ | ❌ |
| Publish jobs | `jobs.publish` | ✅ | ✅ | ✅ | Optional | ❌ |
| Archive jobs | `jobs.archive` | ✅ | ✅ | ✅ | ❌ | ❌ |

### Candidates
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| View candidates | `candidates.view` | ✅ | ✅ | ✅ | ✅ | Limited |
| Add candidates | `candidates.create` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Edit candidates | `candidates.edit` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Delete candidates | `candidates.delete` | ✅ | Optional | ❌ | ❌ | ❌ |
| Merge duplicates | `candidates.merge` | ✅ | ✅ | Optional | ❌ | ❌ |

### Submissions
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Submit to client | `submissions.submit` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Reject candidate | `submissions.reject` | ✅ | ✅ | ✅ | ✅ | Limited |
| Approve candidate | `submissions.approve` | ❌ | ❌ | ❌ | ❌ | ✅ |

> `submissions.approve` is **client-only** — permissions are not monotonic by
> seniority, so never derive one role's set from another's.

### Clients
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Manage clients | `clients.manage` | ✅ | ✅ | Optional | View | ❌ |
| Client contacts | `clients.contacts` | ✅ | ✅ | ✅ | View | ❌ |

### AI
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Resume parsing | `ai.use` | ✅ | ✅ | ✅ | ✅ | ❌ |
| AI screening | `ai.use` | ✅ | ✅ | ✅ | ✅ | ❌ |
| AI matching | `ai.use` | ✅ | ✅ | ✅ | ✅ | ❌ |
| AI credits | `ai.manage` | ✅ | View | View | View | ❌ |

### Email templates
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Manage templates | `templates.manage` | ✅ | ✅ | Optional | ❌ | ❌ |
| Use templates | `templates.use` | ✅ | ✅ | ✅ | ✅ | ❌ |

### Integrations
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Gmail | `integrations.manage` | ✅ | ✅ | Optional | Connect own | ❌ |
| Calendar | `integrations.manage` | ✅ | ✅ | Optional | Connect own | ❌ |
| LinkedIn Extension | `integrations.useExtension` | ✅ | ✅ | ✅ | ✅ | ❌ |
| API / webhooks | `integrations.manageApi` | ✅ | Optional | ❌ | ❌ | ❌ |

### Billing
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Subscription | `billing.manage` | ✅ | View | ❌ | ❌ | ❌ |
| Seats | `billing.manage` | ✅ | View | ❌ | ❌ | ❌ |
| Payment method | `billing.managePayment` | ✅ | ❌ | ❌ | ❌ | ❌ |
| Invoices | `billing.view` | ✅ | View | ❌ | ❌ | ❌ |

### Security
| Capability | Permission key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| Workspace security | `security.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| SSO / SAML | `security.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Audit log | `audit.view` | ✅ | View | ❌ | ❌ | ❌ |

### Account settings
Personal, so **not permission-gated** — every authenticated user manages their
own. See the workspace-vs-account split below.

| Capability | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|
| Profile | ✅ | ✅ | ✅ | ✅ | ✅ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ |
| Password & MFA | ✅ | ✅ | ✅ | ✅ | ✅ |
| Calendar | ✅ | ✅ | ✅ | ✅ | ❌ |
| Appearance | ✅ | ✅ | ✅ | ✅ | ✅ |
| Language | ✅ | ✅ | ✅ | ✅ | ✅ |

## Workspace vs account settings

- **Workspace settings** = organization-wide defaults and business rules.
- **Account settings** = personal preferences and optional overrides.

Where a setting exists in both, the workspace defines the **default** and the
account may **override** it. Label them accordingly: workspace reads "Default
language / Default date format / Default time format"; account reads "Display
language" with a `Use workspace default` checkbox that reveals the picker when
unchecked.

| Setting | Workspace | Account |
|---|---|---|
| Agency logo / name, email branding, white-label reports | ✅ | ❌ |
| Candidate duplicate detection, candidate/job ID prefixes | ✅ | ❌ |
| Date format, time format, language | ✅ default | ✅ override |
| Theme (dark/light), sidebar, density, animations | ❌ | ✅ |
| UI accent color | ❌ | ✅ |
| Notifications, password, calendar, email signature | ❌ | ✅ |

**Two different accent colors.** Report accent (Workspace → Report Branding)
affects client-facing reports and emails. UI accent (Account → Appearance)
affects only that user's interface. Keep them separate so changing a personal
colour never alters client-facing branding.

## Migration delta (current code → target)

| | Today | Target |
|---|---|---|
| Roles | `admin \| lead \| employee \| client` | `owner \| admin \| profileLead \| recruiter \| client` |
| Actions | `read \| create \| edit \| update \| delete` | verbs above (`manage`, `invite`, `remove`, `view`, `use`, `publish`, `archive`, `merge`, `approve`, …) |
| Resources | 8-name union in `packages/configurations/src/access.ts` | the domains above |
| Custom roles | not supported (`ROLES` derives from `DEFAULT_ROLE_PERMISSIONS` keys) | agency-defined roles as permission sets |
| "Optional" cells | no concept | matrix-configurable, default off |

**The engine does not need rewriting.** `domain.action` is the authoring form of
the existing `AccessRule` — `members.invite` is `{ resource: "members", action:
["invite"] }`. `canAccess` does set-membership on action strings, so the work is:

1. Widen `AccessAction` and the `Resource` union (`packages/types/src/index.ts`,
   `packages/configurations/src/access.ts`).
2. Rewrite `DEFAULT_ROLE_PERMISSIONS` to the five roles above.
3. Migrate `user.role` values (`employee`→`recruiter`, `lead`→`profileLead`,
   promote one `admin` per agency to `owner`) **and** backfill `role_permission`
   rows — `listPermissions` only seeds when an agency has zero rows.
4. Drop `ROLES = Object.keys(DEFAULT_ROLE_PERMISSIONS)` in
   `apps/api/src/services/permission.service.ts`; read the agency's roles from
   the DB so custom roles become possible.
5. Enforce the keys server-side — no settings route checks permissions today.
