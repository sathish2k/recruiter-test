# CLAUDE.md

Quality standards for this monorepo (Next.js + ElysiaJS + Bun). Every feature
must meet three benchmarks: responsive on all screens, accessible (WCAG), and
high-performance (95+ Lighthouse). Automate these checks in the local dev loop —
don't rely on eyeballing.

## Runtime & Module Rules

- Runtime engine: **Bun**. Never execute `npm`, `yarn`, or `pnpm` commands.
- Dependencies: use `bun add <package>` for installs and `bunx` for binary
  execution.
- Elysia is WinterCG compliant. All Elysia code uses native Bun ecosystem
  libraries (`Bun.password`, `Bun.serve`, …) instead of legacy Node.js
  polyfills.

## Responsive Design

- **Mobile-first CSS.** Write all styles from mobile-up. Never write desktop
  styles and try to downscale.
- **Container queries over media queries.** For reusable components (buttons,
  cards), prioritize container queries (`@container`) over screen media queries
  (`md:`, `lg:`) so components stay responsive whether they sit in a
  full-screen grid or a narrow sidebar.
- **Multi-viewport checks.** Verify layouts with Playwright at mobile (375px),
  tablet (768px), and desktop (1440px) widths — screenshot each and check for
  overlapping text or horizontal scrolling.

## Accessibility (a11y)

- **Structural rule:** all interactive elements must be keyboard focusable,
  images must have explicit `alt` tags, and forms must have explicit associated
  `<label>` elements.
- **Axe-Core scans:** use `@axe-core/playwright` to evaluate markup against
  WCAG. Run the audit on the local development build and fix any violations —
  color contrast, missing ARIA attributes, incorrect heading structure — before
  shipping.

## Performance

### Frontend (Next.js)

- Exclusively use `next/image` for images, `next/font` for web fonts (zero
  layout shift), and `next/link` for navigation/prefetching.
- **Dynamic component loading:** always split code bundles by dynamically
  importing client components that sit below the fold using `next/dynamic`
  (heavy components: map widgets, charts, modal flows).

### Backend (ElysiaJS)

- Elysia compiles routes statically — keep code inside routes lightweight.
  Avoid bulky external middleware that compromises its performance.
- **Prevent over-fetching:** use precise `select` schemas when querying the
  database (Drizzle). Never `db.user.findMany()` bare — fetch only the exact
  columns the consuming UI component needs.

## Hydration Safety

- Never use browser-only globals (`window`, `document`, `localStorage`)
  directly in the body of a Next.js component. Wrap them inside a `useEffect`
  hook.
- All dynamic data rendering (localized times, dates, random layout values)
  must use `suppressHydrationWarning` or be wrapped in a Client Component that
  renders strictly after mounting (`isMounted` state check).

## Single-Source-of-Truth Types (Eden Treaty)

- Never write manually duplicated TypeScript definitions for API responses on
  the frontend.
- All component data types infer their shapes from the backend by exporting the
  Elysia app instance type: `export type App = typeof app;`.
- The frontend consumes this type exclusively via
  `import type { App } from "@/server"`.

## Context Hygiene

Keep heavy directories out of Claude Code's context — `.gitignore` (or
`.claudeignore`) must block:

```
.next/
node_modules/
.bun/
dist/
build/
*.log
.env*
```

## Pre-Push Quality Gate

Before pushing any feature code, run the full check:

> Run a comprehensive production build (`bun run build`). Execute Playwright
> tests across mobile and desktop layout dimensions, scan the page layout for
> Axe accessibility issues, and verify that all Next.js Server Components
> render statically without accidentally falling back into slow dynamic
> client-side rendering. Refactor any code that fails these rules.
