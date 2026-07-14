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

## TableRendererConfig

- `columns: [{ label: { name: <t-key> }, value: <GenericRenderer cell config>, align?, width?, sort?: { key } }]`
  Cells dispatch through `GenericRenderer` (`string`, `entity`, `ai-match`,
  `pill`, `date`, `currency`, `actions`, `menu`, `icon`, `link`, …). Missing
  cell types are added as new renderers in `packages/shared/src/components/renderers/`,
  never inline in the table.
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
