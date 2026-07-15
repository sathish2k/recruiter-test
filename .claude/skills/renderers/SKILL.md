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
| `pill` | colored pill (label = raw value) | `path`, `styles: { [value]: { fg, bg, border } }` |
| `status` | translated colored chip | `path`, `labels: { [value]: <t-key> }`, `colors`, `variant`, `dot` |
| `score-bar` | `{score}%` + gradient progress bar (band-colored text) | `path`, `suffix?: "%"`, `threshold?` |
| `actions` | inline icon-button row | `actions: ActionItem[]` |
| `menu` | kebab (⋮) dropdown | `actions: ActionItem[]` |
| `icon` | IconRenderer | `name`/`src`/`path`, `size`, `color` |
| `link` | LinkRenderer | LinkRendererConfig |

Repeated cell/value look = a new renderer file here + a case in
`generic-renderer.tsx` — never bespoke markup in a feature or table. A
genuinely one-off cell = a **custom table cell**: give the column
`value: { type: "myKey" }` and pass `<TableRenderer cells={{ myKey: (row) => … }} />`.
Custom cells are a TableRenderer concern (resolved in TableCellRenderer, not
GenericRenderer) — see the table-renderer skill.

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

Config (single or array — array auto-grids; `data` prop feeds it a row directly,
like TableRenderer, so a screen with one combined fetch can drive the grid):
`{ label: { name }, value: <GenericRenderer cfg>, delta?, variant?, icon?, sub?, progress?, action?, link? }`.
Renders a theme `Card` (`variant` overrides the default: `interactive` when
`link` is set, else `base`). Two layouts:
- **Classic** (no `icon`/`sub`/`progress`): label, then value + optional `delta`
  (`variant:"pill"` = Chip; else inline text). `delta` still does single-brace
  `{value}` replacement from one data path.
- **KPI** (`icon` and/or `sub` present): header row = label + top-right `icon`
  (`{ name, size?, color? }`), then value, then a `sub` line
  (`{ name, sx? }`). `sub`/`progress` text interpolates against the **full data
  row** via i18next `{{token}}` (e.g. `"{{invPct}}% of target"`).
- The accent "Invites sent today" special: `progress: { targetPath }` renders a
  target bar (value = data path + optimistic local increments) and
  `action: { label, icon?, toast? }` renders a "+ Log" button that bumps the
  count and toasts. Kept on the renderer (not a bespoke module) so the whole
  4-card grid stays on one component — ponytail-noted in the source.

## FunnelRenderer

`<FunnelRenderer id config? data? />` — a titled `Card` of labeled horizontal
gradient bars (label + bar at `pct%` + a `valueFormat` value) plus an optional
trailing amber `Alert` insight note. Config:
`{ title: { name }, stageLabelPrefix?, valueFormat: { name }, insight?: { name, icon? } }`;
data: `{ stages: [{ key, count, pct, tone? }], insightStage?, insightDrop? }`.
`valueFormat`/`insight` interpolate via i18next `{{token}}` (stage row / `{ stage, drop }`).
`tone: "success"` swaps a stage's bar to the green gradient (default orange).

## GraphRenderer / Chart (ApexCharts)

`GraphRenderer` (config: `type bar|line|area|pie|donut`, `series: [{ label, path, color }]`,
`categoryPath`, header/filters) and `GraphFilterRenderer` build series+options via
`buildSeries`/`buildOptions` and hand them to `Chart`. `Chart` drives the core
`apexcharts` lib imperatively (dynamic import, recreate-on-change) — the
`react-apexcharts` wrapper renders blank under React 19/Turbopack: NEVER
reintroduce it. Never pass `undefined`-valued top-level option keys (apex reads
`.colors` off every key). The dashboard hiring chart is a bespoke CSS-bars
design-match, not ApexCharts.
