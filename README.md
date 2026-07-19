# AI Recruiter

Bun + Turborepo monorepo. A single root `package.json` holds all dependencies;
each app carries only a minimal `package.json` (name + scripts) and resolves
dependencies through the bun workspace.

## Structure

```
apps/
├── web/          # ATS Application       — Next.js 16 (port 3000)
├── api/          # Bun + Elysia API      — Bun runtime (port 3001)
├── marketing/    # Landing website       — Next.js 16 (port 3002)
├── desktop/      # Tauri Desktop App     — Tauri v2 + Vite (port 3003)
└── docs/         # Engine / dev docs     — Next.js 16 (port 3004)
.github/workflows/  # CI (bun install → check → typecheck → build)
docker/             # Dockerfiles + docker-compose (api, web, marketing, postgres)
```

## Auth & data

- **Auth** — [Better Auth](https://better-auth.com) (email + password). The
  server lives in `apps/api` under `/api/auth/*`; the web app consumes it via
  the client in `apps/web/src/lib/auth-client.ts`.
- **Database** — PostgreSQL via [Drizzle ORM](https://orm.drizzle.team). Schema
  in `apps/api/src/db/schema.ts`, connection in `apps/api/src/db/index.ts`.

## Requirements

- [Bun](https://bun.sh) `1.3.14`
- PostgreSQL (or run `docker compose -f docker/docker-compose.yml up postgres`)
- For `apps/desktop`: [Rust](https://rustup.rs) + the
  [Tauri prerequisites](https://tauri.app/start/prerequisites/)

## Getting started

```bash
bun install          # install all workspace deps from the root
cp apps/api/.env.example apps/api/.env    # then set BETTER_AUTH_SECRET + DATABASE_URL
bun run db:push      # push the Drizzle schema to Postgres
bun run dev          # run all apps via turbo
```

Per-app:

```bash
bun run --filter=@recruit/api dev
bun run --filter=@recruit/web dev
bun run --filter=@recruit/marketing dev
bun run --filter=@recruit/docs dev
bun run desktop      # tauri dev (native window)
```

## Scripts

| Command | Description |
|---|---|
| `bun run dev` | Run every app (turbo) |
| `bun run build` | Build every app |
| `bun run check` | Biome lint + format check |
| `bun run typecheck` | `tsc --noEmit` across apps |
| `bun run db:push` | Push Drizzle schema to Postgres |
| `bun run db:studio` | Open Drizzle Studio |
| `bun run desktop` | Tauri dev (desktop app) |

## Docker

```bash
docker compose -f docker/docker-compose.yml up --build
```
