---
name: roles-permissions
description: How roles, resources and permissions work — the AccessRule vocabulary, where the engine enforces it, the per-agency permission store, the agreed 5-role target model, and the checklist for adding a resource or gating a screen. Use when gating a route/tab/element, adding a permission resource, editing the Roles & Permissions matrix, securing an API route, or splitting workspace vs account settings.
---

# Roles & permissions

RBAC, per agency, stored in Postgres and editable in Settings → Roles &
permissions. A permission is a **resource → allowed actions** map; a role owns
one map; a user has one role.

Read `CLAUDE.md` and the `architecture` skill first — access rules ride on the
same Route / Configuration / LayoutElement objects the engine already renders.

> **`target-model.md` (next to this file) is the agreed product spec** — the five
> built-in roles, the full capability matrix, the permission-key vocabulary, the
> workspace-vs-account settings split, and the migration delta. This file
> documents the *mechanics as implemented*; that file documents *what we're
> building toward*. When they disagree, the target model wins for new design
> decisions and this file wins for "how do I make the code work today".

## Two rules that outrank everything else

1. **Never branch on a role name.** `if (user.role === "owner")` is always wrong;
   check a permission instead. Built-in roles are just predefined permission
   sets — that is what allows custom roles later without code changes.
2. **Permissions are not monotonic by seniority.** `submissions.approve` is
   client-only; the Owner does not hold it. Never derive one role's set from
   another's, and never assume "higher role ⊇ lower role".

## Vocabulary

| Type | Where | Value |
|---|---|---|
| `UserRole` | `packages/types/src/index.ts` | `admin \| lead \| employee \| client` |
| `AccessAction` | same | `read \| create \| edit \| update \| delete` |
| `RolePermissions` | same | `Record<resource, AccessAction[]>` |
| `Resource` | `packages/configurations/src/access.ts` | the resource-name union |
| `DEFAULT_ROLE_PERMISSIONS` | `packages/types/src/index.ts` | **seed + offline fallback only** |
| `AccessRule` | `packages/recruit-sdk/src/types.ts` | `{ resource, action?, attributes? }` |
| `AccessContext` | same | `{ attributes, permissions }` — the current user |

`"*"` as a resource is the wildcard (admin holds `{ "*": ALL }`).
`action` **defaults to `["read"]`** when omitted.
`attributes` adds ABAC on top of RBAC: `{ role: ["lead"] }` requires
`context.attributes.role` to be in that list.

### Permission keys are `AccessRule`s in disguise

The target model authors permissions as dotted keys. They are the same thing —
`members.invite` **is** `{ resource: "members", action: ["invite"] }`. `canAccess`
does plain set-membership on action strings, so adopting the target vocabulary
means widening the `AccessAction` and `Resource` unions, **not** rewriting the
engine. Actions are not limited to CRUD: `manage`, `invite`, `remove`, `view`,
`use`, `publish`, `archive`, `merge`, `approve` are all valid once declared.

## Declaring access (config, never code)

Attach `access` to a route, a layout element, or **any object inside a
component configuration**:

```ts
// routes.ts — gates the whole branch, children included
{ id: "Recruit.Settings.Route", path: "settings", access: { resource: "settings" } }

// a page/layout element — element disappears if denied
{ id: "settings-audit", type: "component", componentType: "…", access: { resource: "audit", action: ["read"] } }

// deep inside a *.configuration.ts — this sidenav item / tab / kebab action
{ label: "nav.auditLog", routeId: "…", access: { resource: "audit", action: ["read"] } }
```

Real examples: `sidenav.configuration.ts`, `appbar.configuration.ts:52`,
`settings-tabs.configuration.ts:29`, `routes.ts:38`.

## How it is enforced

All of this runs **server-side in the orchestrator** before render
(`packages/recruit-sdk/src/engine/orchestrator.tsx:286-311`):

1. `accessResolver()` (app-supplied, `apps/web/src/access.ts`) → `AccessContext`.
2. `canAccessRoutes` — every matched route's rule must pass, else `onAccessDenied()`
   (`redirect("/permission-denied")`).
3. `filterConfigurationsAccess` — drops page/layout elements the user fails.
4. `filterConfigAccess` — **deep**-walks each component configuration, removing
   any object whose `access` rule fails and stripping the `access` keys.

Net effect: **components receive a configuration already scoped to the user** —
never write an access check inside a feature component. `useAccess()` exists
(`providers/access-provider.tsx`) for the rare runtime branch; prefer config.

`canAccess` itself: `packages/recruit-sdk/src/access.ts`.

### Guards ≠ access

`guard: [{ type: "authenticationGuard" }]` is **authentication** (is there a
session — `apps/web/src/guards.ts`); `access` is **authorization** (may this
user see it). Guards inherit to child routes; so does `access`.

## The store (API)

- Table `role_permission` — one row per `(agency, role)`, id `${agencyId}:${role}`,
  `permissions` a jsonb resource→actions map (`models/role-permission.model.ts`).
- `services/permission.service.ts` — `seedAgencyPermissions` (idempotent, from
  `DEFAULT_ROLE_PERMISSIONS`), `listPermissions` (seeds on first read),
  `roleHolders` (the matrix's role-card counts), `updateRolePermissions`.
- `GET /permissions` → `[{ role, permissions: [{resource, actions}] }]` plus
  `meta.holders`. `PUT /permissions/:role` replaces one role's map.
- The DB is the runtime source of truth. `DEFAULT_ROLE_PERMISSIONS` is only the
  seed for a new agency and the offline fallback.

## Adding a resource

Check `target-model.md` first — the capability may already have an agreed
permission key. Invent a new one only if it genuinely isn't in the matrix.

1. Add it to the `Resource` union (`packages/configurations/src/access.ts`).
2. Add it to each role in `DEFAULT_ROLE_PERMISSIONS` (`packages/types/src/index.ts`),
   following the target matrix's defaults.
3. **Ship a migration/backfill** merging the key into existing `role_permission`
   rows — `listPermissions` only seeds when an agency has *zero* rows, so
   existing agencies never pick up new keys on their own.
4. If it should appear in the matrix, add it to `resources` + a `groups` entry +
   an `icons` entry in `permissions.configuration.ts`.
5. Reference it from configs as `access: { resource: "<name>", action: [...] }`.
6. Enforce it in the API handler too — the UI gate is not a security boundary.

## Gotchas

- **A typo'd resource silently hides UI.** `canAccess` denies any resource
  absent from the user's map, and the element is then stripped without warning.
  There is no unknown-resource check — grep the union before inventing a name.
- **`filterConfigAccess` treats any object with a string `resource` field as a
  rule** when it sits under an `access` key. Don't name an unrelated config
  field `access` if its value has a `resource` property.
- **`updateRolePermissions` replaces the whole map.** It writes exactly the list
  the client sent, so any resource the matrix doesn't render is wiped on save.
  Send the full map, or merge server-side, before adding matrix rows.
- **`settings` does double duty** — it gates the Settings route *and* is a matrix
  row, so toggling the row can lock a role out of the screen that contains it.
  Keep route-gating resources out of the editable matrix. (The target model's
  granular keys — `workspace.manage`, `members.view`, `billing.view` — retire
  this problem; don't add new matrix rows on top of the old `settings` key.)
- **Client-side filtering is cosmetic.** Stripping an element hides a control; it
  does not stop the request. The API is the real boundary.
- **Client-role data isolation is a query scope, not a permission.** A client must
  never see other clients, recruiters, billing, internal notes or audit logs.
  Enforce that by scoping the query in the service layer; a `canAccess` rule only
  hides the UI and will leak through any direct API call.
- **Account settings are never permission-gated.** Profile, notifications,
  password/MFA, appearance and language belong to the user, not the workspace —
  gate them on authentication only. See the split table in `target-model.md`.
- **The API currently enforces authentication only.** `plugins/auth-guard.ts`
  exposes `isAuth` (session → `ctx.user`) and an unused `requireRole(role)`;
  every settings route is `isAuth: true` with no permission check. A new
  mutating route must not assume the UI gated it — check the caller's
  permissions in the handler until a `requirePermission` macro exists.
- **`accessResolver` reads the static map, not the DB** (`apps/web/src/access.ts`
  → `ROLE_PERMISSIONS[role]`), so edits saved in the matrix do not yet change
  what the UI shows. Fetch `GET /permissions` server-side (forward the cookie —
  the axios `httpClient` is client-only and carries no session) and fall back to
  `DEFAULT_ROLE_PERMISSIONS` on failure.
