---
name: renderers
description: Catalog of the shared config-driven renderers — GenericRenderer cell types, IconRenderer, LinkRenderer (incl. wrapping any component), StatCardRenderer, GraphRenderer/Chart. Use when rendering a value/cell/link/icon/stat/graph or adding a new renderer type.
---

# Shared renderers (`packages/shared/src/components/renderers/`)

Everything visual is driven by a config object with a `type`; components never
hardcode text (translation keys) or targets (route ids) — those live in
`*.configuration.ts` / `*.translations.json`. Renderers are built from themed
atoms only (Button/Chip/Card/Avatar/IconButton/Menu — see the architecture
skill); no inline chrome, no comments in `.tsx`.

## GenericRenderer (the dispatcher)

`<GenericRenderer config data actionHandler? />` dispatches on `config.type`:

| type | renders | key config |
|---|---|---|
| `string`/`text` | text at `path` | `sx` |
| `static-translation` | fixed t-key | `value`, `swatch` |
| `number` / `currency` / `date` | locale-aware (useFormatters) | `path` |
| `boolean` / `status` | yes-no / status dot | `path` |
| `entity` | tile/avatar + title + subtitle | `shape`, `bgPath/fgPath/textPath`, `title`, `subtitle` |
| `ai-match` | sparkle + value | `path`, `suffix`, `color`/`colorPath` |
| `pill` | colored pill | `path`, `styles: { [value]: { fg, bg, border } }` |
| `actions` | inline icon-button row | `actions: ActionItem[]` |
| `menu` | kebab (⋮) dropdown | `actions: ActionItem[]` |
| `icon` | IconRenderer | `name`/`src`/`path`, `size`, `color` |
| `link` | LinkRenderer | LinkRendererConfig |

New cell/value looks = a new renderer file here + a case in
`generic-renderer.tsx` — never bespoke markup in a feature or table.

## IconRenderer — the ONLY icon source

`ICON_REGISTRY` (icon-renderer.tsx) maps name → MUI icon; also accepts an image
`src` (url/data-uri) or a data-driven `path`. Never import `@mui/icons-material`
in features or build local icon maps — add the name to the registry instead.
`<IconRenderer name="add" size={16} color="#..." />`

## LinkRenderer — the ONLY navigation primitive

Config: `{ routeId | href | path, label: { name } | text, params, queryParams, target, sx, ... }`.
Route ids resolve via `usePortalRouter` → SPA `next/link`. Two modes:
- Text link: `<LinkRenderer config={cfg} data={row} />`.
- **Wrap any component**: pass children — `<LinkRenderer config={cfg}><Card .../></LinkRenderer>`
  (defaults to `underline:none`, `color:inherit`). Used by stat cards and the
  table header "View all" pill.
- Pass filters to a target screen via `queryParams`:
  `{ filters: { type: "static", value: JSON.stringify({ status: ["Active"] }) } }`
  → `?filters=<json>` which the target's `useFilters` reads. Sort via
  `sortKey`/`sortDir` params, which `useSort` reads.

## StatCardRenderer

Config (single or array — array auto-grids): `{ label: { name }, value: <GenericRenderer cfg>, delta?: { name, value, variant?: "pill" }, link?: LinkRendererConfig }`.
Renders a theme `Card` (`interactive` when `link` is set, else `base`).

## GraphRenderer / Chart (ApexCharts)

`GraphRenderer` (config: `type bar|line|area|pie|donut`, `series: [{ label, path, color }]`,
`categoryPath`, header/filters) and `GraphFilterRenderer` build series+options via
`buildSeries`/`buildOptions` and hand them to `Chart`. `Chart` drives the core
`apexcharts` lib imperatively (dynamic import, recreate-on-change) — the
`react-apexcharts` wrapper renders blank under React 19/Turbopack: NEVER
reintroduce it. Never pass `undefined`-valued top-level option keys (apex reads
`.colors` off every key). The dashboard hiring chart is a bespoke CSS-bars
design-match, not ApexCharts.
