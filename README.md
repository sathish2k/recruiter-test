# AI Recruiter

Turborepo + Bun monorepo. Next.js (MUI, next-auth, SWR, React Hook Form) web app
and an Elysia + mongoose API.

## Layout

```
apps/
  web/                 Next.js app (App Router). Framework glue only under src/app.
  docs/                Next.js docs site (MUI) — engine guide + live demos (:3002)
  api/                 Elysia API. route → controller → service → model.
    src/routes/        *.routes.ts — wiring only, auto-registered (Bun.Glob)
    src/controllers/   request handlers
    src/services/      business logic (HTTP-free; created only where needed)
    src/models/        mongoose schemas ONLY
    src/plugins/       cross-cutting Elysia plugins (auth-guard)
    src/lib/           mailjet + gemini clients
    src/db.ts          mongoose connection singleton
packages/
  recruit-sdk/         @recruit/sdk — the config-driven engine (+ API client, hooks)
  configurations/      @recruit/configurations — ALL routes / pages / layouts (pos-billing style)
    src/routes.ts      every Route (ids: Module.Page.Route)
    src/layouts/       every layout Configuration (core, auth, …)
    src/pages/         one <module>.ts per module → a Record of page Configurations
    src/registry.ts    AllModules — the feature modules to register
  ui/                  @recruit/ui — the MUI theme (Troy design system), no wrappers
  shared/              @recruit/shared — cross-cutting helpers/composites
  types/               @recruit/types — framework-free shared domain types
  modules/             feature components only (config lives in @recruit/configurations)
    recruit-auth/      @recruit/module-auth — sign-in / sign-up / backdrop
    recruit-dashboard/ @recruit/module-dashboard — dashboard/home components
    recruit-candidate/ @recruit/module-candidate — candidate feature
```

Screens are **config-driven** (pos-billing pattern): `@recruit/configurations`
describes routes → layouts → pages (referencing components by id);
`@recruit/module-*` holds the components. Each component lives in its own folder
with a **`bootstrap.ts`** (export models) + `<feature>.configuration.ts` +
`<feature>.translations.json`; the module's `index.ts` aggregates the bootstraps.
The web `[[...slug]]` shell builds the engine from `@recruit/configurations`.

## Conventions

- **Single root `package.json`.** Every third-party dep lives here. `packages/*`
  are `@recruit/*` **tsconfig path aliases**, not npm packages — no per-package
  `package.json`. A new alias goes in BOTH `tsconfig.base.json` and
  `apps/web/tsconfig.json` (Next's bundler reads the app's own `paths`).
- **Backend routes auto-register** — drop a `*.routes.ts` in `apps/api/src/routes/`;
  never hand-wire in `app.ts`.
- **Models hold schema only**; logic lives in services.

## Commands

```bash
bun install
bun run dev         # web :3000, api :3001
bun run build
bun run typecheck
bun run check:fix   # biome format + lint
```

Copy `apps/web/.env.example` and `apps/api/.env.example` to `.env.local` / `.env`.

## Stack versions (latest as of scaffold)

Next 16 · React 19 · MUI 9 · mongoose 9 · Elysia 1.4 · next-auth 4 ·
`@google/genai` 2.x (Gemini 2.5) · node-mailjet 6 · TypeScript 7 (native) · Bun 1.3

> `packages/recruit-sdk` is a **config-driven engine**: screens are described as
> plain config objects (routes → layouts → pages) and rendered by the engine —
> no hand-written pages under `apps/web/src/app/**`. See [doc/](doc/README.md)
> for the routing + layout authoring guide. It also exposes an HTTP client + SWR
> hooks for feature components.
