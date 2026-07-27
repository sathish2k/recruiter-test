# Module 02 - User Roles & Permissions

> **Open question — missing source of truth.** `doc/00-Glossary-and-Conventions.md` does
> not exist in this repository at the time of writing, so no canonical role vocabulary
> could be read. This chapter therefore reconciles three sources that are all in use
> today: the **design screens** (§1.5), the **implemented data model**
> (`packages/types/src/index.ts`, `packages/configurations/src/access.ts`) and the
> **agreed target permission model** (`.claude/skills/roles-permissions/target-model.md`).
> Every conflict found is recorded in §1.4 and §16 rather than silently resolved. When
> Module 00 is written, it wins; this chapter is then corrected, not Module 00.

---

# 1. Overview

## 1.1 Purpose

This module defines the security model for HirePilotX. It answers three separate
questions that are often confused with one another:

1. **What may this person do at all?** — the role and the permission keys it grants.
2. **Whose records may they do it to?** — the client-access list.
3. **Which records inside that set are theirs?** — the assignment.

All three must be satisfied for a record to be visible or actionable. They are
orthogonal: widening one never widens another.

## 1.2 What this module owns

- The catalogue of roles, both built-in and workspace-defined.
- The permission-key vocabulary and the read-only variant of a permission.
- The three scoping dimensions and how they combine.
- Role assignment, promotion and demotion rules.
- The external client-portal identity as a role type.
- Role preview (previewing the product as another member).
- What the product does when access is refused.

## 1.3 What this module does not own

| Concern | Owning module |
|---|---|
| The Roles & permissions editing screen, its matrix layout and save semantics | Module 05 |
| Seats, invitation mechanics, suspension, password reset, offboarding | Module 04 |
| Workspace-level defaults, resume-privacy masking levels | Module 03 |
| Sessions, MFA, SSO, API tokens, the audit log schema | Module 35 |
| The client portal itself — magic links, decision capture, portal visibility | Client Portal module |
| Dashboard variants and their widgets | Module 26 |

## 1.4 Naming reconciliation

The same role has up to three names. This chapter uses the **target-model machine
value** as primary and records the others.

| Design wording | Target machine value | Display label | Implemented `UserRole` today |
|---|---|---|---|
| "Owner" | `owner` | Owner | `admin` |
| "Admin" | `admin` | Admin | `admin` |
| "Profile Lead" / "Profile lead" | `profileLead` | Profile Lead | `lead` |
| "Recruiter" | `recruiter` | Recruiter | `employee` |
| "Employee (Sourcer)" / "Sourcer" | `sourcer` (custom role) | Sourcer | `employee` |
| "Team Lead" | `teamLead` (custom role) | Team Lead | — |
| "Hiring Manager" | `hiringManager` (custom role) | Hiring Manager | — |
| "Finance" | `finance` (custom role) | Finance | — |
| Client portal actor | `client` | Client contact | `client` |

Corrections to the previous version of this chapter:

| Previous content | Correction |
|---|---|
| "Workspace Owner" | The role's display label is **Owner**. "Workspace Owner" is retired. |
| Role set was Owner / Profile Lead / Recruiter / Viewer | **Viewer does not exist.** It appears in no design screen. Read-only access is expressed by the read-only permission variant (§4.4) or by a custom role, not by a dedicated role. |
| "Support custom roles in future versions" | Custom roles ship **today**. Sourcer is a shipped custom role. |
| Admin, Finance, Hiring Manager, Team Lead absent | Added (§2). |
| Client contact absent | Added as an external role type (§8). |
| Scoping was role + client access only | A third dimension, **assignment**, is added (§6). |

## 1.5 Source screens

`AIRecruiter - Settings` (Members, Roles & permissions, Security tabs),
`AIRecruiter - Employee Dashboard`, `AIRecruiter - Lead Dashboard`,
`AIRecruiter - Permission Denied`.

---

# 2. The role model

## 2.1 Role types

| Machine value | Display label | Meaning |
|---|---|---|
| `system` | System role | Built-in. Ships with a fixed permission set. Cannot be renamed or have its permissions edited. |
| `custom` | Custom role | Defined by the workspace. Name, description and every permission are editable. |

Both types are assignable to members and both appear in the member role picker,
grouped under the headings **SYSTEM ROLES** and **CUSTOM ROLES**.

## 2.2 Role record

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `id` | string | Yes | Workspace-scoped. System roles use the reserved values in §1.4. |
| `name` | string | Yes | Display label. Unique within the workspace, case-insensitive. Editable on `custom` only. |
| `description` | string | No | One line explaining the role's job. Editable on `custom` only. |
| `type` | enum | Yes | `system` or `custom`. Set at creation, never changed. |
| `basedOn` | role id | No | Recorded when the role was created from another role (§3.2). Informational only — there is no inheritance at runtime. |
| `permissions` | permission-key set | Yes | The granted keys (§4). Fixed for `system`. |
| `locked` | boolean | Yes | True only for `owner`. A locked role cannot be edited or deleted. |
| `memberCount` | integer | Yes | Derived. Number of active members holding the role. |
| `createdBy` / `createdAt` | member ref / timestamp | Yes on `custom` | — |

## 2.3 System roles

| Role | Display label | Purpose | Editable | Deletable |
|---|---|---|---|---|
| `owner` | Owner | Owns the subscription. Full workspace control — clients, contracts, billing, members and settings. | No | No |
| `admin` | Admin | Runs the workspace — members, branding, roles, jobs, candidates, templates, integrations, security. Does not control ownership or payment details. | No | No |
| `profileLead` | Profile Lead | Runs requirements end to end: reviews CVs, submits to clients, schedules interviews. | No | No |
| `recruiter` | Recruiter | Sources candidates — outreach, JD sharing, CV uploads and AI screening. | No | No |
| `client` | Client contact | External. Client portal only. Sees the submissions made to their own organisation and decides on them. | No | No |

Rules:

| # | Rule |
|---|---|
| 2.3.1 | A system role's permission set is a fixed template. To vary it, the workspace duplicates the role (§3.2) and edits the copy. |
| 2.3.2 | `owner` holds every workspace permission by definition and is not represented as an editable permission set. |
| 2.3.3 | Exactly one member holds `owner` at any time. |
| 2.3.4 | `client` is never assigned from the Members screen. It is created by inviting a client contact to the portal (§8). |
| 2.3.5 | Permissions are **not monotonic by seniority**. A senior role's set is never derived from a junior role's. The clearest case: approving a submitted candidate is held only by `client` — no internal role holds it. |

## 2.4 Shipped custom roles

The designs show four roles that are assignable to members but are not system roles.

| Machine value | Display label | Evidence | State |
|---|---|---|---|
| `sourcer` | Sourcer | Shipped custom role with a defined permission set (§5.3). Used as the Employee Dashboard persona. | Defined |
| `teamLead` | Team Lead | Appears in the assignable role list with its own identity treatment. | Name only |
| `hiringManager` | Hiring Manager | Appears in the assignable role list. | Name only |
| `finance` | Finance | Appears in the assignable role list. Implied duties: invoices, payouts, commission release. | Name only |

> **Open question:** are Team Lead, Hiring Manager and Finance seeded custom roles
> shipped with every workspace, or example rows in the designer's fixture data?
> PROPOSED — needs product sign-off: seed all four as custom roles so that a new
> workspace can assign them on day one, with Finance pre-granted the commission and
> invoice capabilities and no candidate-facing capability.

---

# 3. Custom roles

## 3.1 Creation

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `name` | string | Yes | Rejected when empty. Rejected when it collides with an existing role name. |
| `basedOn` | role id | Yes | Chosen from a picker grouped into **SYSTEM ROLES** and **CUSTOM ROLES**. Defaults to `recruiter`. |
| `description` | string | No | Defaults to a line stating which role it was based on. |

On creation the new role starts with a **copy** of the base role's permission set.
The copy is a one-time snapshot: later changes to the base role do not propagate.

## 3.2 Duplicate

Duplicating a role creates a new `custom` role named `Copy of <name>` with an exact
copy of the source role's permissions, selected for editing. Duplicating is the only
way to vary a system role's permissions.

## 3.3 Editing and deletion

| # | Rule |
|---|---|
| 3.3.1 | Only `custom` roles expose editable permission toggles. On a `system` role every toggle is displayed but inert. |
| 3.3.2 | Saving a role applies to **everyone holding that role**, immediately, without re-authentication. |
| 3.3.3 | A `custom` role may be deleted. A `system` role may not. |
| 3.3.4 | Deleting a role that still has holders is refused until those members are reassigned. |
| 3.3.5 | A role may not remove the permission that grants access to the Roles & permissions screen while that role is being edited by its own holder. |
| 3.3.6 | Renaming a role does not change its machine value; audit history keeps the value it recorded at the time. |
| 3.3.7 | Custom roles are unlimited by plan — the plan card states "unlimited roles". |

---

# 4. Permission vocabulary

## 4.1 Shape of a permission

A permission is a dotted key of the form `<resource>.<action>`, for example
`members.invite`. A role holds a set of keys. Access to any surface, control, list
or API route is decided by testing for a key — **never by comparing a role name**.

## 4.2 Capability permissions

These are the twelve toggles presented on a role, in three groups. Every label below
is the exact wording shown; the key is the machine value.

**Recruiting**

| Display label | Permission key | Meaning |
|---|---|---|
| Send LinkedIn invites & share JD | `sourcing.outreach` | Reach out to candidates and share job descriptions from the sourcing queue. |
| Upload & manage received CVs | `candidates.edit` | Add CVs to the pool and edit candidate records. |
| Run AI screening on CVs | `ai.use` | Summarise, score and rank resumes. Consumes AI credits. |
| Review CVs & submit to client | `submissions.submit` | Approve screened CVs and send them to the client portal. |
| Call candidates & schedule interviews | `interviews.schedule` | Book interview slots and log call outcomes. |
| Export candidates | `candidates.export` | Download candidate data. Held separately because it is often restricted for junior recruiters. |
| Delete candidates | `candidates.delete` | Permanently remove candidate records. Deliberately kept separate from edit rights. |

**Jobs & clients**

| Display label | Permission key | Meaning |
|---|---|---|
| Manage roles / jobs | `jobs.manage` | Open, edit and close requirements. |
| Manage clients & contracts | `clients.manage` | Edit client records, contacts and fee contracts. |
| View dashboard & reports | `reports.view` | See pipeline analytics and weekly digests. |

**Workspace**

| Display label | Permission key | Meaning |
|---|---|---|
| Invite & manage team members | `members.invite` | Send invites, change roles and deactivate members. |
| Configure automation & integrations | `integrations.manage` | Connect services and edit automation rules. |

> **Open question:** two toggles bundle capabilities that the designs treat separately
> elsewhere — "Configure automation & integrations" covers both the Automation module
> and the Integrations hub, and "Invite & manage team members" covers inviting,
> changing roles and deactivating. PROPOSED — needs product sign-off: keep the bundled
> toggle as the authoring control, but store it as the set
> `{ integrations.manage, automation.manage }` and
> `{ members.invite, members.remove, roles.assign }` respectively, so a future screen
> can split them without a data migration.

## 4.3 Surface permissions

Settings tabs are gated by their own keys. These are not shown as toggles on the role
screen; they are implied by the role's administrative standing.

| Tab | Required key | Read-only alternative |
|---|---|---|
| Workspace | `workspace.manage` | — |
| Members | `members.view` | — |
| Roles & permissions | `roles.manage` | — |
| Email templates | `templates.manage` | — |
| Integrations | `integrations.manage` | `integrations.readonly` |
| Billing | `billing.view` | — |
| Security | `security.view` | — |
| Audit log | `audit.view` | — |

| # | Rule |
|---|---|
| 4.3.1 | A tab whose key the user does not hold is **absent from the tab bar entirely**. It is not shown disabled, and it is not shown with a lock. |
| 4.3.2 | If the user holds no key for any tab, Settings is not reachable at all and does not appear in navigation. |
| 4.3.3 | The same key gates the corresponding API routes. Hiding a tab is cosmetic; the API is the boundary. |

## 4.4 The read-only variant

A capability may be granted in a reduced, read-only form. The read-only key is a
distinct key, not an attribute of the full key.

| Full key | Read-only key | Behaviour when only the read-only key is held |
|---|---|---|
| `integrations.manage` | `integrations.readonly` | Tab renders with a **Read-only** badge beside its label. Every control is disabled. Connect, disconnect, reconnect and sync-direction changes are refused. |
| `security.manage` | `security.view` | Policies are visible; none can be changed. |
| `billing.manage` | `billing.view` | Plan, seats and invoices are visible; no purchase, seat change or cancellation. |
| `ai.manage` | `ai.use` | Credits and quota are visible; thresholds and quota cannot be changed. |

| # | Rule |
|---|---|
| 4.4.1 | Holding a full key implies the read-only behaviour is unnecessary — the badge is shown only when the full key is absent and the read-only key is present. |
| 4.4.2 | A read-only surface must still be reachable by deep link, and must render the badge on arrival, not only when navigated to from the tab bar. |
| 4.4.3 | A read-only key never permits an export unless an export key is also held. |

## 4.5 Permission values

The following value vocabulary from the previous version of this chapter is retained,
now expressed as the action segment of a key rather than a cell in a grid.

| Machine value | Display label | Meaning |
|---|---|---|
| `none` | No Access | The key is absent. Surface hidden, request refused. |
| `view` | View | Read-only. |
| `create` | Create | Create records. |
| `edit` | Edit | Modify existing records. |
| `delete` | Delete | Remove records. |
| `export` | Export | Download data. |
| `manage` | Manage | Full administration of the resource, including the four above. |

Additional action verbs in use: `invite`, `remove`, `use`, `publish`, `archive`,
`merge`, `approve`, `submit`, `schedule`, `assign`.

---

# 5. Capability matrix

Legend: **✅** granted by default · **❌** never granted · **Optional** configurable,
default off · **View** read-only variant · **Limited** scoped subset.

## 5.1 By system role

| Capability | Key | Owner | Admin | Profile Lead | Recruiter | Client |
|---|---|---|---|---|---|---|
| View dashboard & reports | `reports.view` | ✅ | ✅ | ✅ | ✅ | Limited |
| Send LinkedIn invites & share JD | `sourcing.outreach` | ✅ | ✅ | ❌ | ✅ | ❌ |
| Upload & manage received CVs | `candidates.edit` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Run AI screening on CVs | `ai.use` | ✅ | ✅ | ✅ | ✅ | ❌ |
| Review CVs & submit to client | `submissions.submit` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve / decline a submission | `submissions.approve` | ❌ | ❌ | ❌ | ❌ | ✅ |
| Call candidates & schedule interviews | `interviews.schedule` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Export candidates | `candidates.export` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Delete candidates | `candidates.delete` | ✅ | Optional | ❌ | ❌ | ❌ |
| Manage roles / jobs | `jobs.manage` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage clients & contracts | `clients.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Invite & manage team members | `members.invite` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Configure automation & integrations | `integrations.manage` | ✅ | ✅ | View | ❌ | ❌ |
| Edit workspace settings | `workspace.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| View members | `members.view` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Manage roles & permissions | `roles.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create custom roles | `roles.create` | ✅ | Optional | ❌ | ❌ | ❌ |
| Manage email templates | `templates.manage` | ✅ | ✅ | ✅ | ❌ | ❌ |
| Billing | `billing.view` / `billing.manage` | ✅ | ❌ | ❌ | ❌ | ❌ |
| Payment method | `billing.managePayment` | ✅ | ❌ | ❌ | ❌ | ❌ |
| Security policies | `security.view` / `security.manage` | ✅ | ✅ | ❌ | ❌ | ❌ |
| Audit log | `audit.view` | ✅ | ❌ | ❌ | ❌ | ❌ |
| API tokens & webhooks | `integrations.manageApi` | ✅ | Optional | ❌ | ❌ | ❌ |

Two rows deserve emphasis because they break the usual seniority intuition:

- **`submissions.approve` is client-only.** The Owner cannot approve a submission.
- **`audit.view` and `billing.*` are Owner-only** even though Admin holds
  `workspace.manage`, `roles.manage` and `security.view`. Admin's Settings tab bar
  therefore omits Billing and Audit log entirely.

## 5.2 By module

Extends the previous version's matrix to every module in the designed product.
CRUD = create, read, update, delete.

| Module | Owner | Admin | Profile Lead | Recruiter | Sourcer | Client |
|---|---|---|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | Limited |
| Clients | CRUD | CRUD | View | ❌ | ❌ | ❌ |
| Client Contacts | CRUD | CRUD | View | ❌ | ❌ | ❌ |
| Jobs / Requirements | CRUD | CRUD | CRUD | View own | View own | ❌ |
| Candidates | CRUD | CRUD | CRUD | Create/Edit | Create/Edit | Limited |
| Sourcing & outreach | ✅ | ✅ | ❌ | ✅ | ✅ | ❌ |
| Sourcing plugin / extension | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| AI Screening | Manage | Manage | Run | Run | Run | ❌ |
| CV review queue | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Submissions | CRUD | CRUD | CRUD | ❌ | ❌ | Decide only |
| Pipeline board | CRUD | CRUD | CRUD | Move own | Move own | ❌ |
| Interviews | CRUD | CRUD | CRUD | View | ❌ | Limited |
| Interview feedback | CRUD | CRUD | CRUD | View | ❌ | Own panel only |
| Offers | CRUD | CRUD | View | ❌ | ❌ | ❌ |
| Placements | CRUD | CRUD | View | ❌ | ❌ | ❌ |
| Invoices | CRUD | View | ❌ | ❌ | ❌ | ❌ |
| Commissions | CRUD | View | Own | Own | Own | ❌ |
| Analytics & Reports | ✅ | ✅ | Scoped | Own | Own | ❌ |
| Team Activity | ✅ | ✅ | Scoped | ❌ | ❌ | ❌ |
| Messages | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Notifications | ✅ | ✅ | ✅ | ✅ | ✅ | Portal only |
| Automation | Manage | Manage | View | ❌ | ❌ | ❌ |
| Email Templates | Manage | Manage | Manage | Use | Use | ❌ |
| Integrations | Manage | Manage | View | Connect own | Connect own | ❌ |
| Members | CRUD | CRUD | View | ❌ | ❌ | ❌ |
| Roles & permissions | CRUD | CRUD | ❌ | ❌ | ❌ | ❌ |
| Workspace settings | CRUD | CRUD | ❌ | ❌ | ❌ | ❌ |
| Billing | CRUD | ❌ | ❌ | ❌ | ❌ | ❌ |
| Security | Manage | Manage | ❌ | ❌ | ❌ | ❌ |
| Audit log | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Client portal (as a viewer) | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |
| Account settings | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

**Account settings are never permission-gated.** Profile, notifications, password and
MFA, appearance and language belong to the user, not the workspace, and are reachable
by every authenticated identity including a client contact.

## 5.3 The Sourcer custom role

Shipped as an example of a narrowed Recruiter — "sources candidates and runs outreach,
no client-facing actions". Its granted set is exactly:

| Granted | Not granted |
|---|---|
| Send LinkedIn invites & share JD | Review CVs & submit to client |
| Upload & manage received CVs | Call candidates & schedule interviews |
| Run AI screening on CVs | Export candidates · Delete candidates |
| View dashboard & reports | Manage roles / jobs · Manage clients & contracts |
| | Invite & manage team members · Configure automation & integrations |

Compared with the `recruiter` system role, Sourcer differs only in that it grants
`reports.view` on the same footing and is editable. The Employee Dashboard is the
Sourcer's home screen.

---

# 6. The three scoping dimensions

## 6.1 The dimensions

| Dimension | Question it answers | Where it is set | Where it is enforced |
|---|---|---|---|
| Role | May this person perform this action at all? | Members tab, role picker | Permission-key check on every surface and route |
| Client access | Whose clients' records may they touch? | Members tab, Client access column | Query predicate on `clientId` |
| Assignment | Which records inside those clients are theirs? | Requirement's Assigned Team | Query predicate on the assignment join |

**Effective visibility is the intersection of all three.** A capability the role does
not grant cannot be recovered by client access; a client outside the access list is
invisible even where the role grants the capability; a record inside an accessible
client is still hidden from an assignment-scoped surface when the user is not on it.

## 6.2 Client access

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `accessMode` | enum | Yes | `all_clients` (All clients) · `unassigned` (Unassigned) · `selected` (specific list). |
| `clientIds` | client ref[] | Yes when `accessMode` is `selected` | Multi-select with search. Zero selected is equivalent to `unassigned`. |

| # | Rule |
|---|---|
| 6.2.1 | Client access is chosen at invitation time and editable per member afterwards. |
| 6.2.2 | **An Owner's client access cannot be narrowed.** The control is locked and states that Owners always have access to every client. |
| 6.2.3 | `unassigned` grants access to records not attached to any client, and to nothing else. It is the correct starting state for a member who has not yet been placed on an account. |
| 6.2.4 | Removing a client from a member's list does not reassign or delete records; it removes visibility only. |
| 6.2.5 | Client access restricts the client's contacts, requirements, candidates, submissions, interviews, placements, invoices and activity together. There is no per-entity client access. |
| 6.2.6 | A member's own client access is displayed to them — the sidebar identity card names the clients they can reach. |

## 6.3 Assignment

An assignment is the join between a requirement and the staff working it. It carries
two named duties.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `jobId` | requirement ref | Yes | — |
| `sourcerId` | member ref | Yes | The duty that builds the pipeline. |
| `profileLeadId` | member ref | No | The duty that reviews CVs and submits to the client. |
| `dailyInviteTarget` | integer | No | Per-assignment outreach target. |
| `assignedBy` / `assignedAt` | member ref / timestamp | Yes | — |

| # | Rule |
|---|---|
| 6.3.1 | Assignment is a duty on a requirement, not a role. A member holding `profileLead` who is not the assigned profile lead on a requirement does not review its CVs. |
| 6.3.2 | A profile lead's team-facing views show **only the members working on that lead's requirements**, and only within the lead's client access. The lead never sees agency-wide member output. |
| 6.3.3 | A recruiter or sourcer sees the requirements they are assigned to. The navigation item is labelled **My Jobs** for them, not **Jobs**. |
| 6.3.4 | Removing an assignment removes the record from that member's assignment-scoped queues immediately. It does not change record ownership. |
| 6.3.5 | Assignment never widens client access. A member cannot be assigned to a requirement belonging to a client they cannot reach; the picker excludes them. |

## 6.4 Related scoping that is not a permission

| Mechanism | Owning module | Note |
|---|---|---|
| Resume-privacy masking level | Module 03 | Hides candidate name, email, phone, LinkedIn and resume attachment until a chosen stage. Applies on top of all three dimensions. |
| Per-submission anonymisation | Submissions module | The submitting lead may hide contact details until the client approves. |
| Note visibility | Candidate Profile module | A note is either internal or client-visible. Client-visible is the only kind a client contact ever sees. |
| Client data isolation | §8 | A hard query-level boundary, not a permission toggle. |

---

# 7. Assigning and changing a role

## 7.1 Where

Settings → Members. The role is an inline picker on the member row, grouped into
system and custom roles.

## 7.2 Rules

| # | Rule |
|---|---|
| 7.2.1 | A user holds exactly one role at a time. |
| 7.2.2 | `owner` is **not offered** in the role picker. Ownership transfer is out of band — the workspace contacts support. |
| 7.2.3 | Promoting a member to `owner` or `admin` requires an explicit confirmation step naming the member and the target role, and stating that the role grants full workspace control over clients, billing, members and security settings, and that the change is reversible. |
| 7.2.4 | Demoting from `admin` to any other role needs no confirmation. |
| 7.2.5 | A member cannot change their own role. |
| 7.2.6 | At least one member must hold `owner` at all times. |
| 7.2.7 | Role changes take effect immediately, without the affected member re-authenticating. |
| 7.2.8 | Every role change is audited with both the previous and the new role. |
| 7.2.9 | Changing a role does not change client access; the two are edited independently. |

## 7.3 Member status and access

| Machine value | Display label | Can sign in | Consumes a seat |
|---|---|---|---|
| `active` | Active | Yes | Yes |
| `invited` | Invited | No — until the invitation is accepted | No |
| `suspended` | Suspended | No | Yes |
| `disabled` | Disabled | No | No |

| # | Rule |
|---|---|
| 7.3.1 | A suspended or disabled member's records, notes and activity remain in place and continue to be attributed to them. |
| 7.3.2 | Suspension is reversible from the same control (**Activate**). |
| 7.3.3 | Removing a member revokes access; it does not delete the data they created. |
| 7.3.4 | A pending invitation does not consume a seat. A seat is consumed on acceptance. |

---

# 8. External identity: the client contact

## 8.1 What it is

A client contact is an **external identity**, not a workspace member. It is a separate
identity system with its own authentication, its own session and its own visibility
model.

| Property | Workspace member | Client contact |
|---|---|---|
| Machine role | `owner` … `recruiter`, or a custom role | `client` |
| Authentication | Email and password, plus workspace MFA policy | Passwordless magic link |
| Appears in Members | Yes | No |
| Consumes a seat | Yes | No |
| Has client access list | Yes | No — hard-scoped to their own organisation |
| Can be assigned to a requirement | Yes | No |
| Home screen | A dashboard variant | The client portal |

## 8.2 Capabilities

| # | Rule |
|---|---|
| 8.2.1 | A client contact sees only the submissions made to their own organisation, and only the fields the submitting agency chose to share. |
| 8.2.2 | A client contact holds `submissions.approve`, which no internal role holds. Approving, declining, holding or requesting another profile is theirs alone. |
| 8.2.3 | A client contact must never see another client, any agency member's details, internal notes, billing, commissions, the audit log or any other client's candidates. |
| 8.2.4 | This isolation is enforced as a **query scope in the service layer**, not as a permission rule. A permission check only hides interface; it does not stop a direct request. |
| 8.2.5 | Every portal action is attributed in the audit log to the client contact by name, with the client portal named as the actor type. |
| 8.2.6 | A client contact reaches their own account settings — profile, notifications, password — and nothing else. |

## 8.3 Access grant

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `contactId` | contact ref | Yes | The client contact being granted portal access. |
| `clientId` | client ref | Yes | Derived from the contact. The scope of everything they can see. |
| `issuedBy` | member ref | Yes | The agency member who shared the portal link. |
| `linkExpiresAt` | timestamp | Yes | The share link's validity window. |
| `tokenExpiresAt` | timestamp | Yes | The sign-in token's validity window — far shorter than the link's. |
| `revokedAt` | timestamp | No | Set when access is withdrawn. Takes effect on the next request. |

> **Open question:** the exact link and token lifetimes, device binding and the
> allowlist rule belong to the Client Portal module and are stated there. This chapter
> records only that they are separate values and that the token is much shorter-lived
> than the link.

---

# 9. Role-scoped navigation

Navigation is a projection of permissions. An item whose permission the user does not
hold is absent — never disabled, never shown with a lock.

| Group | Owner / Admin | Profile Lead | Recruiter / Sourcer | Client contact |
|---|---|---|---|---|
| MAIN | Dashboard | Dashboard | Dashboard | Portal home |
| RECRUITMENT | Clients, Contacts, Jobs, Candidates, Interviews, Placements | Candidates, Interviews | My Jobs, Candidates | Submitted candidates |
| INSIGHTS | Analytics, Commissions, Team Activity | Analytics, Commissions | Analytics, Commissions | — |
| AI | AI Screening, Automation | AI Screening | AI Screening | — |
| TOOLS | Settings, Integrations, Help Center | Help Center | Integrations, Help Center | — |

| # | Rule |
|---|---|
| 9.1 | The navigation item reading **Jobs** for agency-wide roles reads **My Jobs** for assignment-scoped roles. It is the same module, scoped differently. |
| 9.2 | Neither the profile lead nor the recruiter sees Clients, Contacts, Placements, Team Activity or Settings in navigation. |
| 9.3 | Every signed-in identity reaches its own account settings from the account menu regardless of role, including Workspace settings when — and only when — it holds at least one Settings tab key. |
| 9.4 | The signed-in user's role and client access are displayed to them in the sidebar identity card, so that a missing screen is explainable without asking an administrator. |

> **Open question:** the Lead navigation in the designs omits Integrations even though
> the Profile Lead role holds `integrations.readonly`, which is the key that renders
> the Integrations tab in read-only form. PROPOSED — needs product sign-off: show
> Integrations to the profile lead in read-only form, and treat its absence in the
> design as an omission rather than a rule.

---

# 10. Preview as role

An agency-wide user may view the product as another member sees it.

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `previewing` | boolean | Yes | True only while a preview session is active. |
| `subjectMemberId` | member ref | Yes when `previewing` | The member being previewed. |
| `subjectRole` | role id | Yes when `previewing` | Rendered with its display label. |
| `subjectClients` | client ref[] | No | The previewed member's client access, named in the banner. Omitted when unrestricted. |
| `startedAt` | timestamp | Yes when `previewing` | — |

| # | Rule |
|---|---|
| 10.1 | A persistent banner is shown for the whole preview, naming the member, their role and their client access, and offering **Exit preview**. |
| 10.2 | Preview is **read-only**. Every mutating control renders but does not fire. |
| 10.3 | Preview requires `members.view`. It grants the previewer none of the previewed role's permissions for any other purpose. |
| 10.4 | Preview state is never persisted across sessions and never survives sign-out. |
| 10.5 | Entering and leaving preview are both audited, naming both identities. |
| 10.6 | Preview is not impersonation for support purposes. A support operator acting as a member is a separate mechanism owned by Module 35, is not read-only, and no workspace role can invoke it. |

---

# 11. Access denied

## 11.1 When it is shown

A signed-in user reaches a route their role does not permit. Denial is decided on the
server before any data is fetched.

| Condition | Behaviour |
|---|---|
| Not signed in | Redirect to sign-in. The access-denied screen is never shown to an anonymous visitor. |
| Signed in, route permission absent | Access-denied screen. |
| Signed in, element permission absent | The element is removed from the screen. No message. |
| Signed in, read-only key only | The screen renders with the **Read-only** badge and disabled controls (§4.4). |
| API request without the permission | Refused with the same code as the screen. The response body never reveals the record's existence or contents. |

## 11.2 Screen content

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| `headline` | string | Yes | Default: "This page is locked for your role". After a request is sent: "Request sent — hang tight". |
| `explanation` | string | Yes | States that the current role does not include this permission and offers the two available routes forward. |
| `requestAccessAction` | action | Yes | Primary action. Sends an access request to the workspace administrator. |
| `requestState` | enum | Yes | `idle` (Request access) · `sent` (Access requested). |
| `confirmation` | string | Yes when `requestState` is `sent` | Names the administrator the request was sent to and states that the user is notified when access changes. |
| `backAction` | action | Yes | Returns the user to their own dashboard — the variant their role does resolve to. |
| `errorCode` | string | Yes | `403`. Displayed so it can be quoted to support. |
| `supportLink` | action | Yes | Contact the workspace administrator. |

| # | Rule |
|---|---|
| 11.2.1 | The screen names no record, client, candidate or member. It must not confirm that the target exists. |
| 11.2.2 | The access request is addressed to a member holding `roles.manage`, named in the confirmation. |
| 11.2.3 | A repeated request for the same permission does not create a second request. |
| 11.2.4 | An access request is a notification, not a grant. Nothing changes until an administrator edits the role or reassigns the member. |
| 11.2.5 | The back action must resolve for every role, including a role with no permitted modules; in that case it returns to account settings. |

> **Open question:** is an access request recorded as a first-class object with a
> status, or is it a one-shot notification? PROPOSED — needs product sign-off: record
> it, so that an administrator can see outstanding requests and so that rule 11.2.3 is
> enforceable across sessions.

---

# 12. Invitation

Invitation mechanics — multi-address entry, seats, resend, cancel, the workspace join
link and the expiry window — are specified in **Module 04**. This section states only
what invitation contributes to the security model.

Preconditions

- The inviter holds `members.invite`.
- A seat is available, or one is purchased as part of the flow.

Navigation

Settings → Members → Invite members

| Field | Type | Required | Rules/Notes |
|---|---|---|---|
| Work email | string[] | Yes | One address per line. Every address in the batch receives the same role and client access. |
| Role | role id | Yes | Any system or custom role except `owner`. |
| Client access | enum + client ref[] | Yes | `all_clients` · `unassigned` · `selected` (§6.2). Defaults to `all_clients`. |
| Welcome message | string | No | Included in the invitation email. |

Flow

1. The inviter enters one or more work email addresses.
2. The inviter selects the role and the client access for the batch.
3. Invitations are sent. Each invitee's status becomes `invited` / Invited.
4. The invitation link expires after a fixed window; an expired link cannot be used.
5. The invitee accepts and sets a password.
6. The member's status becomes `active` / Active and a seat is consumed.

| # | Rule |
|---|---|
| 12.1 | An email address may hold only one active membership per workspace. |
| 12.2 | A duplicate invitation to an address that already has a pending invitation is refused. |
| 12.3 | An invitation to a domain outside the workspace's allowed email domains is refused, naming the offending addresses. The whole batch is refused, not the valid subset. |
| 12.4 | Cancelling a pending invitation invalidates its link immediately. |
| 12.5 | The role and client access on an accepted invitation are the member's starting values; both are editable afterwards. |

---

# 13. Business rules

| # | Rule |
|---|---|
| 13.1 | Never branch on a role name. Every gate in the product is a permission-key check. Built-in roles are predefined permission sets — that is what allows a workspace to add its own roles without a product change. |
| 13.2 | Permissions are not monotonic by seniority. No role's set is derived from another's. |
| 13.3 | A user belongs to exactly one workspace-scoped role at a time. |
| 13.4 | Email must be unique within a workspace. |
| 13.5 | Permission and role changes apply immediately and are audited. Existing audit history is never rewritten. |
| 13.6 | Suspended and disabled users cannot sign in. Removing a user does not delete the data they created. |
| 13.7 | Repeated failed sign-in attempts lock the account for a fixed period. The lock-out threshold and duration are specified in Module 35. |
| 13.8 | Hiding a control is cosmetic. Every rule in this chapter is enforced server-side. |
| 13.9 | The workspace boundary is absolute. No role, no client access list and no assignment ever reaches another workspace's records. |
| 13.10 | Client-contact isolation is a query scope, not a permission. It is enforced in the service layer. |
| 13.11 | Account settings are never permission-gated. |
| 13.12 | A permission the workspace has not defined behaves as absent, not as granted. An unknown key denies. |

---

# 14. Audit

Every event below is written to the workspace audit log under the **Permissions**
category, with the actor, timestamp and originating address.

| Event | Recorded detail |
|---|---|
| Invitation sent | Address, role, client access |
| Invitation resent / cancelled | Address |
| Invitation accepted | Address, resulting member |
| Role changed | Member, previous role, new role |
| Role created | Role name, base role |
| Role duplicated | Source role, new role |
| Role permissions saved | Role, each key granted or revoked, previous and new value |
| Role deleted | Role name, holders reassigned |
| Client access changed | Member, previous list, new list |
| Member suspended / activated | Member |
| Member removed | Member |
| Access request raised | Requesting member, permission requested |
| Preview started / ended | Previewer, previewed member |
| Portal access granted / revoked | Client contact, client, issuing member |

| # | Rule |
|---|---|
| 14.1 | An audit entry records the role's machine value at the time of the event, so that a later rename does not rewrite history. |
| 14.2 | An event whose write fails must not report the originating action as successful. |
| 14.3 | A client contact never sees the audit log. |

---

# 15. Acceptance criteria

- Every role in §2 is assignable, and the picker groups system and custom roles.
- The Owner role cannot be selected from the role picker, edited or deleted.
- Promoting a member to Owner or Admin requires an explicit confirmation naming the member and the role.
- An Owner's client access control is locked and states why.
- A custom role can be created from a base role, duplicated, renamed, re-permissioned and deleted; a system role can only be duplicated.
- Saving a role's permissions changes what every holder can do without them signing out.
- A Settings tab whose key the user lacks is absent from the tab bar; a tab held only by its read-only key renders with the Read-only badge and inert controls.
- A profile lead's team views show only members working on that lead's requirements, within that lead's clients.
- A recruiter's navigation reads My Jobs and shows only their assigned requirements.
- A client contact can approve or decline a submission; no internal role can.
- A client contact cannot reach any other client's records by any route, including a direct request.
- Reaching a denied route shows the access-denied screen with a 403 code, a request-access action and a route back to the user's own dashboard, and names no record.
- Denied API requests are refused server-side even when the corresponding control was hidden.
- Every event in §14 appears in the audit log with previous and new values where applicable.

---

# 16. Open questions

> **Open question:** the previous version of this chapter defined a **Viewer** role. It
> appears in no design. This chapter retires it in favour of read-only permission
> variants and custom roles. Confirm that no customer commitment depends on a Viewer
> role existing by name.

> **Open question:** are Team Lead, Hiring Manager and Finance seeded custom roles or
> fixture data? See §2.4.

> **Open question:** the designs bundle automation with integrations, and inviting with
> role changes and deactivation, into single toggles. See §4.2.

> **Open question:** should the profile lead see Integrations in read-only form? The
> role holds the read-only key but the navigation omits the item. See §9.

> **Open question:** is an access request a stored object with a status, or a one-shot
> notification? See §11.2.

> **Open question:** the implemented roles (`admin`, `lead`, `employee`, `client`) and
> the target roles (`owner`, `admin`, `profileLead`, `recruiter`, `client`) differ. The
> migration that splits `admin` into `owner` and `admin` must decide which existing
> administrator becomes the single Owner, and must backfill each workspace's stored
> permission map — a workspace that already has stored permissions will not pick up new
> keys on its own.

> **Open question:** does the workspace MFA policy apply to client-portal contacts, or
> only to members? Module 35 records the same question; one answer must serve both.

---

# Next Module

Module 03 - Workspace
