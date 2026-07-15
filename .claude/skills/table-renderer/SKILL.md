---
name: table-renderer
description: How to build config-driven tables with TableRenderer / TableFilterExportRenderer — columns, cells, sort, server-side pagination, filters, export, CTAs, kebab actions, titled header. Use when adding or changing any list/table screen.
---

# TableRenderer

Source: `packages/shared/src/components/table-renderer/`. Real configs:
`recruit-jobs/src/jobs/jobs.configuration.ts`,
`recruit-candidate/src/candidates/candidates.configuration.ts`,
`recruit-dashboard/src/recent-candidates/*` (titled-header variant).

A feature component is one line: `<TableFilterExportRenderer id={id} />` or
`<TableRenderer id={id} />` — everything else comes from the id's
configuration, translation and datasource.

**Every table goes through TableRenderer.** A repeated cell look → a new
GenericRenderer cell type (see the renderers skill). A genuinely one-off cell →
a custom cell resolved from the `cells` prop (below). Never hand-roll
`<Table>/<TableHead>/<TableCell>/<TableRow>` in a feature.

## TableRendererConfig

- `columns: [{ label: { name: <t-key> }, value: <cell config>, align?, width?, sort?: { key } }]`
  A cell `value` is either a built-in `GenericRenderer` config (`string`,
  `entity`, `ai-match`, `pill`, `status`, `score-bar`, `date`, `currency`,
  `actions`, `menu`, `icon`, `link`, …) or a **custom cell** (below). Missing
  built-in looks are added as new renderers in
  `packages/shared/src/components/renderers/`, never inline in the table.
- **Custom cell (one-off escape hatch)** — the cell `type` IS the key: any
  `value: { type: "myCell" }` whose `type` isn't a built-in GenericRenderer type
  is resolved from the `cells` prop and called with the row:
  `<TableRenderer id={id} cells={{ myCell: (row) => <…themed atom…/> }} />`.
  `cells` lives entirely in the table layer (TableCellRenderer resolves it before
  falling through to GenericRenderer — GenericRenderer knows nothing about it).
  Use for genuinely bespoke cells (e.g. the permissions matrix's per-role
  interactive CRUD toggles — one `cells` key per role, `value: { type: "perm:lead" }`
  etc.). If the look repeats, promote it to a real GenericRenderer type instead.
- **`footer` totals row** — `footer?: { cells: GenericRendererConfig[] }` (one
  cell config per column, aligned to `columns`; an actions-spacer is added when
  `actions` exist). Rendered as a themed non-hoverable `<TableRow>` with a top
  divider and muted text after the body, against the `footerData?: Row` prop
  (default `{}`, e.g. the fetch `meta.totals`). Not part of pagination; omit
  `footer` and the table is unchanged. See `recruit-dashboard/employee-roles`.
- **`score-bar` cell** — `{ type: "score-bar", path, suffix?: "%", threshold? }`
  renders `{score}%` (colored by score band) + a themed gradient progress bar
  (matches the lead CV-queue bars). Used by the screening table.
- `header?` — titled header inside the card: `{ icon, title, subtitle, action?: LinkRendererConfig, actionIcon? }`.
  `subtitle` is i18next-interpolated with the fetch `meta` (e.g. `"{{addedThisWeek}} added this week"`).
  `action` renders via `LinkRenderer` wrapping the pill (children mode).
- `actions?: ActionItem[]` — trailing kebab (⋮) menu per row. `type: "link"` /
  `routeId`/`href` navigate; any other `type` calls `actionHandler[type](row)`
  (pass `actionHandler={{ edit: fn, delete: fn }}` to the renderer).
- `rowRouteId?` — whole row navigates on click.
- `pagination?: { pageSize }`, `emptyLabel?`, `actionsLabel?`.

## Data modes

- **Server mode (default)** — no `data` prop. Query = `{ ...filters, sortKey, sortDir, page, pageSize }`
  via `useFetch(id, { filters })`; `meta.totalCount` drives the page count.
  API must return `{ data, meta: { totalCount } }` and honor those params
  (see `apps/api/src/services/job.service.ts` — `SORT_FIELDS`, `countDocuments` + `skip/limit`).
- **Client mode** — pass `data={rows}`; sort + pagination happen locally.

Sort state lives in `useSort` — synced to the URL (`?sortKey=…&sortDir=…`), so
links can pre-sort a screen. Page state (`usePagination`) resets when filters/sort change.

## TableFilterExportRenderer (toolbar variant)

`TableRendererConfig` plus:
- `filters: FilterConfig[]` — `{ type: "search", key, placeholder }` and
  `{ type: "select", key, label, options }` (multiselect). URL-synced via
  `useFilters` (`?filters=<json>`); overflow collapses into "More filters".
  Datasources comma-join array values; services split to `$in`.
- `export: { types: [{ label, value: "pdf"|"xlsx"|"docx"|"csv", icon, color }] }` —
  exports the full filtered set (separate unpaginated fetch).
- `ctas: [{ label, icon, routeId | action, variant? }]` — `action` emits to the
  `onCta` prop (e.g. open a FormModal on `"add"`).

## Style

All table chrome comes from the theme (`MuiTableContainer` = the card,
`MuiTableCell`, `MuiTableRow`, `MuiTableSortLabel`, `MuiPaginationItem` in
`packages/ui/src/theme.ts`). Never restyle these inline.
