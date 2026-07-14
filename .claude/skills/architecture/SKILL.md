---
name: architecture
description: How this config-driven app is structured — routes, layouts, pages, the component-creation pattern, and the theme/atom composition rules. Use when adding a screen, feature module, or shared component, or when unsure where code belongs.
---

# Architecture

Read `CLAUDE.md` first — this skill is the working checklist on top of it.
Primary pattern reference: `/Users/chithra/Development/pos-billing-develop`
(match it field-for-field); secondary: `/Users/chithra/Development/ai-recruiter-app`.

## The engine

`apps/web/src/app/[[...slug]]/page.tsx` → `createPortalApp({ routes, configurations, modules, guards })`.
URL slug → `findRouteBySlug` → `generateRenderTree` (layout + page Configurations)
→ `PortalRenderer` (RSC) resolves each component's dependencies and wraps the
tree in providers. Components read their slice by id — never prop-drill.

## Routes, layouts, pages (all in `packages/configurations/src`)

- `routes.ts` — one `Route[]` tree. A route: `{ id: "Recruit.Jobs.Route", path: "jobs", layout: "Recruit.Core.Layout", page: "Recruit.Jobs.Page", guard: [{ type: "authenticationGuard" }] }`. Guards inherit to children.
- `layouts/index.ts` — layout Configurations (`template: "core" | "custom"`).
- `pages/<module>.ts` — page Configurations as `Record<string, Configuration>`.
  A `Configuration` = `{ id, gridContainer?, elements: LayoutElement[] }`; each
  element is `{ type: "component", componentType: <component id>, gridItem? }`,
  an `outlet`, a named `slot`, or `{ type: "configuration", configurationId }`
  (nested — how the dashboard splits main column vs right rail).
- `registry.ts` — `AllModules`; `index.ts` — `allConfigurations`.

## Adding a feature component (the 5-file pattern)

`packages/modules/recruit-<domain>/src/<feature>/`:
1. `<feature>.component.tsx` — thin; usually just delegates to a shared renderer by id.
2. `<feature>.configuration.ts` — structure (schema, columns, links, route ids). No text.
3. `<feature>.translations.json` — all text. Per-language files: `<feature>.translations.de.json` → `value: { fallback, de }` in bootstrap.
4. `<feature>.datasource.ts` — optional factory `() => ({ get, create, ... })` using `httpClient`.
5. `bootstrap.ts` — `ComponentDefinition` binding them under a dot-id (`Recruit.<Name>.Component` + `.Configuration/.Translation/.Datasource`).

Then: add to the module's `index.ts` `components`, register the module in
`registry.ts`, reference from a page by `componentType`, point a route at the page.

## Composition rules (non-negotiable)

- **Theme-based components always.** The design system is theme-only
  (`packages/ui/src/theme.ts`). Never hardcode chrome (`#1C1C1B`/`#1F1F1E`
  backgrounds, `rgba(255,255,255,…)` borders, radii, the orange gradient,
  pill shapes) in component `sx` — use the themed atom:
  - `Button` — `contained` = orange-gradient pill CTA; `contained color="secondary"`
    = light on-dark pill; `outlined` = bordered pill; `text` = link-style.
  - `IconButton` — 30px bordered circle (`color="primary"` = soft-orange active;
    `edge="end"` = borderless input adornment).
  - `Chip variant="soft"` (per palette color) — pills, badges, deltas, active-filter chips.
  - `Card` variants `base | interactive | accent | feature | ghost | inset`.
  - `Avatar` (`circular`/`rounded`) — initials circles, logo/icon tiles.
  - `Tabs`/`Tab` — pill segmented toggles; `Menu`/`MenuItem` + `Paper
    variant="dropdown"` — dropdown surfaces; `Dialog` — modals; themed
    `Table*`, `Pagination`, `OutlinedInput`; shared `SearchField` for search pills.
  - Colors via tokens: `text.primary/secondary/disabled`, `divider`,
    `background.paper`, `primary.*`. If a look is missing, add a theme
    variant — never inline chrome.
- **Atoms build shared components.** `packages/shared` components are composed
  from plain `@mui/material` atoms + theme variants (no wrapper components).
- **Shared components build features.** Feature modules compose
  `@recruit/shared` renderers (`TableRenderer`, `FormRenderer`, `GenericRenderer`,
  `IconRenderer`, `LinkRenderer`, …) driven by their `*.configuration.ts` —
  don't reimplement rendering logic in a module.
- **No comments in components.** No narrative `//` or JSX comments in `.tsx`
  files — knowledge belongs in `CLAUDE.md`/skills. Only `biome-ignore`,
  `ponytail:` and `TODO:` survive; JSDoc on exported config types is allowed.
- Data via `useFetch(id, { filters })`; navigation via `usePortalRouter()` /
  `LinkRenderer` route ids — never `next/link` or `next/navigation` directly.
- Detail routes: path `"jobs/:id"`-style (static siblings like `jobs/new` win on
  specificity). Components read params with `useRouteParams()` from
  `@recruit/sdk` and fetch via `useFetch(id, { filters: { id } })`; table rows
  pass `{ id: row.id }` automatically when `rowRouteId` is set, and link
  configs use `params: { id: { type: "dynamic", path: "id" } }`.

## Access control

- **Rule shape** — routes, page/layout elements, and component-config parts
  (columns, links, actions, sidenav items) may carry
  `access: { resource, action?: AccessAction[], attributes? }`. `action`
  defaults to `["read"]` — read-by-default.
- **Source of truth** — `ROLE_PERMISSIONS` in
  `packages/configurations/src/access.ts` (roles: admin/lead/employee/client;
  admin = `"*"` wildcard). Static config, changed in code only.
- **Engine filtering** — the engine verifies each rule against the user's
  `AccessContext` (built by `accessResolver` in `apps/web/src/access.ts` from
  the session role) before render: a denied **route** triggers
  `onAccessDenied` → redirect to `/permission-denied`
  (`Recruit.PermissionDenied.Route`, no access rule of its own); denied
  **elements** and **config parts** are silently stripped. Client-side, read
  the context with `useAccess()` → `{ context, can(rule) }`
  (`context.attributes.userId/role/agencyId`).
- **Server-side RBAC** — UI filtering is cosmetic; the API enforces for real.
  The users API (`apps/api/src/routes/user.routes.ts`) requires `isAuth` +
  `requireAdmin` (auth-guard macros) — non-admin tokens get 403 regardless of
  what the client renders.

## Verify

```
bunx biome check --write packages apps
bunx turbo run typecheck build --force
bun test packages
```
