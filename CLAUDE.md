# CLAUDE.md

Guidance for working in this repo. The app is **config-driven**: you describe
routes, layouts, and pages as plain objects and the engine (`@recruit/sdk`)
matches the URL, assembles a render tree, resolves each component's
dependencies, and renders it. You almost never hand-write a page.

## Stack

Bun + Turborepo monorepo. Next.js 16 (App Router) + MUI 9 + React 19 web app;
Elysia + Mongoose API. next-auth, SWR, React Hook Form, ajv (JSON-schema forms),
Gemini (`@google/genai`), Mailjet. Biome for lint/format. TypeScript 7.

Single root `package.json` — packages have **no** per-package `package.json`.
They resolve through `@recruit/*` path aliases declared in `tsconfig.base.json`
(and mirrored in each app's `tsconfig.json`). Next uses
`experimental.externalDir` to compile them.

## Layout

```
apps/
  web/     Next.js app. Framework glue only. src/app/[[...slug]] runs the engine.
  api/     Elysia API. route → controller → service → model.
    src/routes/       *.routes.ts — wiring only, auto-registered via Bun.Glob
    src/controllers/  request handlers (HTTP shaping / status codes)
    src/services/     business logic (HTTP-free)
    src/models/       mongoose schemas ONLY (no logic)
    src/plugins/      cross-cutting Elysia plugins (auth-guard)
    src/lib/          external clients (mailjet, gemini)
    src/db.ts         mongoose connection singleton
  docs/    MUI-style docs site — engine guide + live demos.
packages/
  recruit-sdk/     THE HEART. Config-driven engine + providers + hooks.
    src/engine/         orchestrator (createPortalApp), router, renderer
    src/layout-renderer/ layout shells (MuiCoreLayout, MuiAuthLayout)
    src/providers/       GlobalDependency, Locale, Datasource providers
    src/navigation.tsx   usePortalRouter (route-id navigation)
    src/hooks.ts         useFetch (SWR read + mutation)
    src/client.ts        axios client
    src/types.ts         Route / Configuration / LayoutElement / Module / …
  shared/          Cross-cutting composite components + helpers.
    src/components/form-renderer/  JSON-schema form (ajv + react-hook-form)
    src/components/auth/           AuthCard, SignIn, SignUp
    src/components/renderers/      LinkRenderer (config-driven links)
    src/utils/                     cn, format (locale-aware Intl)
  ui/              The "Troy" design system: MUI theme overrides + variants ONLY.
                   No wrapper components — use plain @mui/material with the theme.
  configurations/  The app's routes, layouts, and pages (see below).
  modules/         Feature modules (recruit-auth, recruit-dashboard, …).
  types/           Shared TS types (UserRole, …).
```

## The engine (how a screen renders)

1. `apps/web/src/app/[[...slug]]/page.tsx` calls `createPortalApp({ routes, configurations, modules })`.
2. The URL slug is matched to a branch of `routes` (`findRouteBySlug`).
3. `generateRenderTree` resolves the matched route's layout + page Configurations.
4. `PortalRenderer` (a server component) resolves each component's dependencies,
   then wraps the tree in the providers so components read their slice by id.

**Configurations** live in `packages/configurations/src`:
- `routes.ts` — a single `Route[]` (the URL tree).
- `layouts/index.ts` — layout Configurations (the shells; `template: "core" | "custom"`).
- `pages/<module>.ts` — page Configurations, exported as `Record<string, Configuration>`.
- `registry.ts` — `AllModules` (every feature module).
- `index.ts` — `allConfigurations` (layouts + all pages) + re-exports `routes`, `AllModules`.

A `Configuration` is a list of `LayoutElement`s; each is a `component` (by
`componentType` = a component id), an `outlet`, a named `slot`, or a nested
`configuration`.

## How a component is created

A feature module folder: `packages/modules/recruit-<domain>/src/<feature>/` with:

| File | Purpose |
|---|---|
| `<feature>.component.tsx` | The React component. Engine injects props (below). Often a thin wrapper delegating to a shared generic component. |
| `<feature>.configuration.ts` | Structure/validation config — JSON `schema`, `links`, etc. Text values are translation **keys**, not literals. |
| `<feature>.translations.json` | `{ fallback: {...}, [locale]: {...} }`. Dotted keys (`email.errors.format`). |
| `<feature>.datasource.ts` | A factory `() => ({ get, create, ... })` for API calls (optional). |
| `bootstrap.ts` | Declares the `ComponentDefinition` binding the above together. |

Then:
1. `bootstrap.ts` exports a `ComponentDefinition`:
   ```ts
   export const X_COMPONENT: ComponentDefinition = {
     id: "Auth.CreateAccount.Component",
     type: "COMPONENT",
     value: TheComponent,
     default: {                       // dependency bundle (by ComponentDependency)
       configuration: { id, type: "CONFIGURATION", value: TheConfig },
       translation:   { id, type: "TRANSLATION",   value: { fallback: translations } },
       datasource:    { id, type: "DATASOURCE",    value: theDatasourceFactory },
       // schema optional
     },
   };
   ```
2. The module `index.ts` bundles components into a `Module { id, components: [...] }`.
3. Register the module in `packages/configurations/src/registry.ts` (`AllModules`).
4. Reference the component from a page Configuration by `componentType` = its id.
5. Point a route at that page/layout Configuration. Done — the engine renders it.

### Props the engine injects into every component
`id`, `configuration`, `data`, `translation`, `schema`, `currentRoute`.
Deeply-nested children can also read by id via the hooks below (no prop drilling).

## Data, i18n, navigation

- **Fetching** — `useFetch(id)` (SWR). Reads via the datasource's `get()`;
  returns `{ data, totalCount, error, isLoading, isValidating, mutate, mutation }`.
  Mutations: `await mutation.create(values)` (or `.update`/`.delete`). Server
  prefetch is opt-in per element with `prefetch: true`; default is client-side.
  Client datasource factories are registered via `DatasourceProvider` (fed the
  same modules); the engine only serializes the datasource **id** across the
  server→client boundary.
- **Config / translation by id** — `useConfiguration(id)`, `useComponentData(id)`,
  `useTranslation(id)` → `{ t, language, setLanguage }`. All text lives in
  `*.translations.json`; components render `t("some.key")`.
- **Navigation** — `usePortalRouter()` navigates by route **id**:
  `router.push("Auth.Login.Route")`. Components do NOT import `next/navigation`
  or `next/link` directly.
- **Links** — `LinkRenderer` (config-driven) resolves a `routeId` to a path via
  `usePortalRouter` and renders an MUI `Link` over `next/link` (SPA nav). Its
  config (`routeId`/`href`/`text`/`params`/`sx`/…) lives in the component's
  `*.configuration.ts`; `text` is a translation key resolved by the component.

## Auth

Credentials auth, JWT sessions, shared HS256 secret between next-auth and the API.

1. **Register** — `POST /auth/register` creates the user (`Bun.password.hash`).
2. **Login** — the sign-in form calls next-auth `signIn("credentials")`; its
   `authorize` (`apps/web/src/auth.ts`) POSTs `/auth/login`. The API verifies the
   password (`Bun.password.verify`) and signs a JWT (`JWT_SECRET`, claims
   `{ sub, agencyId, role }`) via the shared `jwtPlugin`.
3. **Session** — next-auth stores that token as `session.accessToken` (jwt +
   session callbacks). The SDK's `AuthProvider` (wraps the tree, needs next-auth's
   `SessionProvider` above it) shows a loader until the session resolves, then
   calls `setAuthToken()` (logout should redirect, which reloads and clears the
   in-memory SWR cache for free).
4. **Requests** — the shared `httpClient` (one axios instance datasources use)
   has a request **interceptor** that attaches `Authorization: Bearer <token>`.
   The API `authGuard` (`isAuth` macro) verifies it with the same secret and
   exposes `ctx.auth` (`{ sub, agencyId, role }`) to handlers.

Env: `JWT_SECRET` (shared, HS256), `NEXTAUTH_SECRET`, `NEXTAUTH_URL`,
`API_URL` / `NEXT_PUBLIC_API_URL`.

### Route guards

A route declares `guard: [{ type: "authenticationGuard" }]`; guards inherit to
child routes. The engine runs the matching guard **function** across the matched
branch before rendering — the SDK stays auth-agnostic, the app supplies the
implementations. `createPortalApp({ …, guards })` takes
`Record<string, RouteGuardFn>`; the web app registers `authenticationGuard`
(`apps/web/src/guards.ts`) to `getServerSession` and `redirect("/login")` when
there's no session. So a guarded route (e.g. `Recruit.Root`) bounces
unauthenticated visitors to login on the server, before any data is fetched.

## Naming conventions

**Ids** — dot-separated PascalCase, `Module.Name.Kind`:
- Route: `Auth.Login.Route` · Layout: `Recruit.Core.Layout` · Page:
  `Recruit.Home.Page` / `Auth.Login.Configuration`
- Component: `Auth.CreateAccount.Component`
- Dependencies: `.Configuration` · `.Translation` · `.Schema` · `.Datasource`
- Module: `Auth.Module`, `Dashboard.Module`
- LayoutElement `id`s inside configurations: kebab-case (`home-welcome`) or the
  `<Owner>.<Name>.<Kind>` form for layout slots/outlets.

**Files** — kebab-case with a role suffix:
- Front end: `<feature>.component.tsx`, `<feature>.configuration.ts`,
  `<feature>.datasource.ts`, `<feature>.translations.json`, `bootstrap.ts`.
- API: `<name>.routes.ts`, `<name>.controller.ts`, `<name>.service.ts`,
  `<name>.model.ts`.

**Packages** — `@recruit/<name>`; feature modules are `@recruit/module-<domain>`.

## API conventions

- `routes/*.routes.ts` — wiring only (path + method + guard). Auto-registered by
  `routes.loader.ts` (Bun.Glob) — never hand-wire in `app.ts`. Elysia validates
  the request body against the route schema (`t.Object`).
- `controllers/` — shape status codes; read identity only from the verified
  token (`ctx.auth`). `services/` — HTTP-free business logic. `models/` — schema
  only. Password hashing uses `Bun.password` (native Argon2; no bcrypt).

## UI / MUI 9

- The design system is theme-only (`packages/ui/src/theme.ts`): custom variants
  via the `variants` array + module augmentation; **no wrapper components**. Use
  plain `@mui/material/*` with the registered variants: `Button contained`
  (orange-gradient pill) / `contained secondary` (light pill) / `outlined`,
  `IconButton` (bordered circle; `color="primary"` soft-orange, `edge="end"`
  borderless adornment), `Chip soft`, `Card
  base|accent|feature|ghost|interactive|inset`, `Avatar`, `Paper dropdown`,
  restyled Tabs/Menu/MenuItem/Dialog/Alert/Table/Pagination/Stepper, and the
  shared `SearchField`. Colors via palette tokens (`text.*`, `divider`,
  `background.paper`).
- **Always use theme-based components.** Never hardcode chrome (`#1C1C1B`
  cards, borders, radii, table styles) in component `sx` — use the themed atom;
  if a look is missing, add a theme variant. Atoms (themed MUI) compose shared
  components (`packages/shared`); shared components compose feature modules.
- MUI 9 removed system shorthand props — use `sx`. Grid uses `size`/`offset`.

## Commands

```
bun test packages                 # unit tests (engine router/renderer)
bunx turbo run typecheck          # typecheck all apps
bunx turbo run build              # build all apps
bunx biome check --write .        # lint + format
```

Verify changes with: `bunx biome check --write packages apps`,
`bunx turbo run typecheck build --force`, `bun test packages`.

Run the API from `apps/api` (`bun run --watch src/index.ts`, port 3001) so Bun
loads `apps/api/.env` (JWT_SECRET etc.) — don't override env vars on the CLI.

## Conventions

- Reuse from `@recruit/sdk` and `@recruit/shared`; don't reimplement engine or
  form/link logic in feature modules.
- Text is never hardcoded in components — it lives in `*.translations.json`.
- Structure/targets (schema, links, route ids) live in `*.configuration.ts`,
  not in the shared component.
- Deliberate shortcuts are marked with a `ponytail:` comment. No narrative /
  AI-style explanatory comments — architecture knowledge belongs here and in
  `.claude/skills/`; keep only functional comments (`biome-ignore`, `ponytail:`, `TODO:`).
- Prefer the minimal change: one abstraction, no speculative flexibility.

## Reference apps

- `/Users/chithra/Development/pos-billing-develop` — PRIMARY. Its `pos-sdk`
  engine, `configurations/`, `usePortalRouter`, `LinkRenderer`, datasource +
  `useFetch`, and route-guard patterns are mirrored into `@recruit/*`. When
  unsure how something should look, check it first and match field-for-field.
- `/Users/chithra/Development/ai-recruiter-app` — secondary (folder structure,
  MUI theme-as-design-system with no wrapper components).

## Design source (Troy)

Screens are designed in Claude Design — project
<https://claude.ai/design/p/6f6b750f-ef0f-4411-a69c-9d63dde59ed0>. Fetch them
via the `claude_design` MCP (`https://api.anthropic.com/v1/design/mcp`, auth
with `/design-login`; in Claude Code use the `DesignSync` tool): `list_files`
on that project id, then `get_file` with a path like
`AIRecruiter - Dashboard.dc.html`. Match implementations to these files
pixel-by-pixel (via the theme's variants, never inline chrome).

## Gotchas

- `apps/docs` sets `typescript.ignoreBuildErrors: true` in `next.config.ts` —
  Next 16's in-build type check crashes on TS 7 for that app. Types are still
  gated by `bunx turbo run typecheck` (`tsc --noEmit`).
- Packages are raw `.ts` source (not built) resolved via tsconfig `paths`;
  Next needs `experimental.externalDir: true` to compile them.
- The editor's TS server uses the root `tsconfig.json` for files under
  `packages/`, so that config `include`s `packages/**` — don't empty it.
- `react-apexcharts` renders a blank canvas under React 19 + Turbopack. The
  shared `Chart` (`packages/shared/src/components/graph-renderer/chart.tsx`)
  drives the core `apexcharts` lib imperatively instead (dynamic import,
  recreate on input change) — never reintroduce the wrapper, and never pass
  `undefined`-valued top-level option keys (apex reads `.colors` off every key).
