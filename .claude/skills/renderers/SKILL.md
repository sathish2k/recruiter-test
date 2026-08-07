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
| `number` / `currency` / `date` | locale-aware (useFormatters) | `path`, date `options` |
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

**Date/number formatting** goes through `useFormatters()` (`@recruit/shared`),
which is locale-aware AND honors the user's **locale preferences** — language,
timezone, date pattern, 12/24h — held in `useLocale` (`@recruit/sdk`). That store
is **seeded server-side on boot**: the root layout (`apps/web/src/locale.ts`
`getBootLocale`) fetches the user's effective prefs (override, else workspace
default) and passes them to `LocaleProvider` as `initialPreferences`, so the
first paint is correct on any device. It's localStorage-backed too (key
`recruit-locale`; falls back to it only when the server gave nothing). The
account **Profile** (timezone) and **Language & formats** tabs update it live via
`useLocale` setters. A **bare** `formatDate(value)` uses the user's date pattern +
timezone; explicit Intl `options` win (a rendered time still picks up
`hour12`/`timeZone`). So `date` cells with no `options` reformat automatically.

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

## TabNavRenderer — the shared area tab bar

Config-driven pill tab bar + optional titled header, behind every "tabs across
the top of a settings-style area" screen (workspace settings, my-account, …).
**Don't hand-write a per-area tab component** — bind one `ComponentDefinition`
per area with `value: TabNavRenderer` and its own `.Configuration` +
`.Translation`; the engine injects `configuration`/`currentRoute` and strips any
tab the user can't access. Config:
`{ title?, subtitle?, subtitleLink?: { text, routeId }, tabs: [{ label, routeId, badge?, access? }] }`
(all text = translation keys). Active tab = the one whose `routeId` matches
`currentRoute`; clicking `router.push`es. See
`recruit-settings/src/settings-tabs/` and `recruit-profile/src/profile-tabs/`
(both are just a config + translations + a bootstrap pointing at `TabNavRenderer`).

## ListSection — the one settings/account list

`<ListSection title? subtitle? icon? badge? headerAction? footer? divided? items />`
— a `Card` with an optional header and a configurable row list. **One component
for every "card of rows" screen** (notification toggles, format pickers,
connected-calendar rows, session lists): don't re-roll bespoke rows. Each
`items[]` entry (`ListSectionItem`) declares its own shape:
`{ key, icon?, title, description?, chips?, action?, control? }` — `icon` =
leading tile, `action` = right-hand control (Switch/Button/segmented),
`control` = full-width control beneath the row. The module supplies live
controls as nodes and builds `items` from its config/state. Pass
`isLoading` (+ `skeletonRows`) to render a skeleton while the fetch is pending
instead of the rows. Reference:
`recruit-profile/src/{notifications,language,appearance,calendar}`.

## StatCardRenderer

Config (single or array — array auto-grids; `data` prop feeds it a row directly,
like TableRenderer, so a screen with one combined fetch can drive the grid):
`{ label: { name }, value: <GenericRenderer cfg>, delta?, span?, variant?, icon?, sub?, progress?, action?, link? }`.
Renders a theme `Card` (`variant` overrides the default: `interactive` when
`link` is set, else `base`). Two layouts:
- **Classic** (no `icon`/`progress`): label, then value + optional `delta`
  (`variant:"pill"` = Chip; else inline text), then an optional `sub` line.
  `delta` does single-brace `{value}` replacement from one data path.
- **KPI** (`icon` and/or `progress` present): header row = label + top-right
  `icon` (`{ name, size?, color? }`), then value, then the `sub` line.
- `sub`/`progress` text interpolates against the **full data row** via i18next
  `{{token}}` (e.g. `"{{invPct}}% of target"`); `sub` takes `{ name, sx? }`.
- The accent "Invites sent today" special: `progress: { targetPath }` renders a
  target bar (value = data path + optimistic local increments) and
  `action: { label, icon?, toast? }` renders a "+ Log" button that bumps the
  count and toasts. Kept on the renderer (not a bespoke module) so the whole
  4-card grid stays on one component — ponytail-noted in the source.

**The grid comes from the config, never a prop.** Columns = the sum of each
card's `span` (default 1), so `span: 2` makes a tile twice as wide as its
neighbours; below `md` the row stacks to one column and spans are ignored.
There is no `gridTemplateColumns` prop — don't reintroduce one.

A stat screen therefore needs no `.component.tsx`: bind
`value: StatCardRenderer` in `bootstrap.ts` next to its `.configuration.ts` +
`.datasource.ts` (see `recruit-dashboard/src/dashboard-stats/`, and the
architecture skill's 5-file pattern).

## SlidingPillTabs (`components/tabs/`)

The app's one pill tab bar: an absolutely-positioned gradient pill measured
against the active tab, so switching **slides** it (`.45s
cubic-bezier(.3,1.4,.35,1)` on left/top/width) instead of swapping a background.
Items are `{ value, render(active) }` — `render` takes the active flag so a tab
can restyle its own badge or dot against the orange fill. Used by
`TabNavRenderer` (settings) and `SegmentedFilterRenderer` (dashboard rail); any
new segmented control goes through it rather than re-deriving the motion.

`SegmentedFilterRenderer` (`components/filters/`) pairs it with a CTA and writes
the selection to a search-param (`param`), which `ListRenderer.filterParam`
reads back into its datasource filters — so the toggle really re-queries, and
the choice survives a reload.

## ListRenderer (`components/list/`)

`<ListRenderer id config? data? actionHandler? />` — the config-driven list, over
the `ListSection` primitive. Row slots (`leading`, `title`, `description`,
`chips`, `trailing`, `action`) are all **GenericRenderer configs**; the list owns
only the row shape. Header takes `title`, `badge` (`{{count}}`), and either a
`headerLink` (circular icon) or `headerTextLink`; `footerLink` renders the
full-width "View All" pill; `emptyText` covers the empty result.

`ListSection` has three row variants — set `variant` on the config:
- `divided` (default) — hairline between rows; `dense` switches to the
  dashboard's compact 10px row with a hover pill.
- `inset` — each row its own inset card, stacked with a 10px gap.
- `timeline` — dot + connector down the left edge, text stacked beside it.

References: `recruit-dashboard/src/dashboard-priorities/` (divided + dense),
`dashboard-upcoming/` (inset), `dashboard-activity-feed/` (timeline).

Two value renderers were added for these: `dot` (`{ type: "dot", size?, color?,
colorPath?, glow? }`) and `metric-group` (`{ type: "metric-group", id, metrics:
[{ path, label, color, valueColor? }] }` — the SLA trio). `static-translation`
also takes `keyPath`/`keyPrefix`, so one config can label rows whose copy differs
per record.

## CardRenderer (`components/cards/`)

`<CardRenderer id config? data? actionHandler? />` — **one** renderer for every
feature card. A themed `Card` shell around three sub-renderers; there are no
per-card components, so a new card is a config, not a file:
`{ variant, padding?, header?, body?, footer?, link?, showPath? }`.
- `CardHeaderRenderer` — `kicker` (`variant: "feature"` = wide-tracked tan,
  `"accent"` = tighter orange with a leading icon) + an `aside` that is **any
  GenericRenderer config**.
- `CardBodyRenderer` — an ordered `CardBodyRow[]`. Each row is
  `{ icon?, value: GenericRendererConfig, sx? }` or `{ divider: true }`. **The
  values go through GenericRenderer** — `entity`, `static-translation`,
  `ai-match`, `pill`, `status`, `date`, … — so cards share one value vocabulary
  with tables and stat cards. The card owns only row layout (leading icon,
  spacing, hairline). Never add a card-local value type; add it to
  `generic-renderer.tsx` and every surface gets it.
- `CardFooterRenderer` — pill `actions` (`variant: "primary" | "outlined" |
  "ghost"`, each `link` or `action`) plus an optional `trailingAction` icon link.
  These are labelled pills, which `ActionsRenderer` (icon-buttons) doesn't cover.

**Never nest a link inside a linked card.** `<a>` inside `<a>` is invalid HTML
and throws a hydration error. When the card sets a top-level `link`, the footer
drops action `link`s and hides `trailingAction` automatically (`insideLink`) —
but write the config the right way round anyway: either the whole card links and
its CTA is decorative, or the card doesn't link and the CTA does. The design's
AI-recommendation card is the first shape (its "Review matches" is a `<span>`).

The design's two cards are pure config over this: **next interview** =
`variant: "feature"` + `entity` / divider / `text` rows + two actions and a
trailing link; **AI recommendation** = `variant: "spotlight"` + accent kicker +
`static-translation` / `ai-match` rows + one ghost action. `EntityRenderer` takes
`avatarSx`/`titleSx`/`subtitleSx` so a feature card can size that block without a
bespoke copy. Row skeletons are derived from each row's `value.type`.

## MessageAlertRenderer

`<MessageAlertRenderer id config? data? />` — the design's inline insight/warning
strips (AI insight banner, pipeline bottleneck note), built on the themed `Alert`.
Config: `{ tone?, icon?, prefix?: { name }, message: { name }, cta?: { name },
translateValues?, showPath?, link? }`.
- `tone` is `accent` (the orange strip — an Alert **variant**, since MUI has no
  primary severity) or an Alert severity: `info|success|warning|error`. On
  `accent` only the icon, `prefix` and `cta` are orange; the sentence itself is
  muted body text (`surface.textMuted`). Severity tones keep one colour
  throughout, which is how the rest of the app reads them.
- `message`/`cta` interpolate against the **full data row** via `{{token}}`.
  `prefix` is the bold lead-in ("AI insight:").
- `translateValues: { token: { path, prefix? } }` resolves a data value that is
  itself a translation key before interpolating it (same trick FunnelRenderer
  hardcodes for its insight stage) — e.g.
  `{ stage: { path: "bottleneckStage", prefix: "stages." } }`.
- `showPath` gates the whole strip on a data path being non-zero/non-empty, so
  an alert about a condition disappears when the condition clears. **Always set
  it** for a data-driven alert; without it the strip renders even at zero.
- `link` wraps the strip via LinkRenderer.

Bind it directly in `bootstrap.ts` (`value: MessageAlertRenderer`) — no wrapper
component. Reference: `recruit-dashboard/src/dashboard-insight/` (the accent
strip under the stat cards).

## FunnelRenderer

`<FunnelRenderer id config? data? />` — a titled `Card` of labeled horizontal
gradient bars (label + bar at `pct%` + a `valueFormat` value) plus an optional
trailing amber `Alert` insight note. Config:
`{ title: { name }, stageLabelPrefix?, valueFormat: { name }, insight?: { name, icon? } }`;
data: `{ stages: [{ key, count, pct, tone? }], insightStage?, insightDrop? }`.
`valueFormat`/`insight` interpolate via i18next `{{token}}` (stage row / `{ stage, drop }`).
`tone: "success"` swaps a stage's bar to the green gradient (default orange).

## BarChartRenderer + StageFunnelRenderer (design-match, CSS not Apex)

The dashboard's two "charts" are **not** chart-library output — they are CSS/flex
layouts with chrome ApexCharts cannot draw (floating peak badge + dot, per-column
conversion pills, inset bar highlight, period pill, metric tabs). Reach for these,
not GraphRenderer, whenever the design shows that treatment.

- `BarChartRenderer` (`graph-renderer/bar-chart-renderer.tsx`) — heading + summed
  total, a `period` pill that opens a **Menu** and feeds its value into `useFetch`
  filters (so the datasource re-queries), `tabs` to switch the plotted `path`
  (the heading follows the active tab), a `valueToggle` ("123") that labels every
  bar, a `peak` badge over the tallest bar, and `categoryDateOptions` to format an
  ISO-date x-axis through `useFormatters`.
- `StageFunnelRenderer` (`renderers/stage-funnel-renderer.tsx`) — the Pipeline
  health board: one column per stage with count, colour dot + translated label
  (`stageLabelPrefix`), a conversion pill (`overallFormat` replaces it on the last
  column), and a column bar. `insight` renders the amber note underneath from the
  fetch's **`meta`**, gated by `showKey` — so the API returns
  `{ data: stages, meta: { bottleneckStage, bottleneckCount } }` and the whole card
  is one request.

Both bind directly in `bootstrap.ts`. References:
`recruit-dashboard/src/dashboard-activity/` and `dashboard-pipeline/`.

**Every data-driven renderer owns a skeleton.** `StatCardRenderer`,
`BarChartRenderer`, `StageFunnelRenderer` and `GraphRenderer` each render a
placeholder from `useFetch`'s `isLoading` that mirrors their real geometry
(same card padding, same column/bar rhythm), so nothing resizes when the data
lands. Add one to any new renderer rather than letting it flash empty.

**`IconRenderer` forwards `className`** — it must, or MUI slot APIs silently lose
their styling hook. `Chip icon=`, `ListItemIcon` etc. clone the element and inject
`MuiChip-icon`/`MuiListItemIcon-*`; a renderer that drops `className` means the
theme's `& .MuiChip-icon` rules never match and the icon renders with no margin.
That is what broke the welcome-card pill spacing.

## GraphRenderer / Chart (ApexCharts)

`GraphRenderer` (config: `type bar|line|area|pie|donut`, `series: [{ label, path, color }]`,
`categoryPath`, header/filters) and `GraphFilterRenderer` build series+options via
`buildSeries`/`buildOptions` and hand them to `Chart`. `Chart` drives the core
`apexcharts` lib imperatively (dynamic import, recreate-on-change) — the
`react-apexcharts` wrapper renders blank under React 19/Turbopack: NEVER
reintroduce it. Never pass `undefined`-valued top-level option keys (apex reads
`.colors` off every key).

X-axis categories come from `categoryPath` on each row. Two options shape them:
- `categoryLabelPrefix` — the row value is a **key**, translated as
  `t(prefix + value)` (mirrors FunnelRenderer's `stageLabelPrefix`). Use this so
  stage/status axis labels stay in `*.translations.json` instead of the API
  returning display text.
- `categoryType: "datetime"` — sets Apex's datetime axis, so a series of ISO
  dates formats itself. Return raw `YYYY-MM-DD` from the API, never a label.

`GraphRenderer` reads config + data by id, so bind it **directly** in
`bootstrap.ts` (`value: GraphRenderer`) with just a `.configuration.ts` +
`.datasource.ts`. References: `recruit-dashboard/src/dashboard-pipeline/`
(bar, translated stage categories) and `dashboard-invites/` (area, datetime
axis).
