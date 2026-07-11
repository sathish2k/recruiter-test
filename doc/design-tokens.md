# Design tokens — the Troy design system

Ported from the Claude Design project **"AI recruiter dashboard design"**
(Component Library + MUI Handoff). Implemented as the `@recruit/ui` MUI theme
([packages/ui/src/theme.ts](../packages/ui/src/theme.ts)). See the live
specimens in the docs site under **Design system → Component library** (`/ui`).

## Palette (dark)

| Token | Value |
| --- | --- |
| `background.default` | `#131313` |
| `background.paper` | `#1C1C1B` |
| inset / wells | `#141413` |
| `primary.main` | `#F26A1B` (light `#FF8A3C`, dark `#E4560F`) |
| primary gradient | `linear-gradient(135deg,#FF8A3C,#E4560F)` |
| `success` | `#4EA874` / light `#8FD6AC` |
| `warning` | `#D69B3C` / light `#F0C27C` |
| `error` | `#C85050` / light `#E89A9A` |
| `info` | `#5A82B4` / light `#9BB8D9` |
| `text.primary` | `#ECEAE7` |
| `text.secondary` | `#9A968E` |
| `text.disabled` | `#7C7972` |
| `divider` | `rgba(255,255,255,0.06)` |
| accent text (links) | `#F0B27C` → hover `#FF9D57` |

**Status chips** use a 14%-tinted background + 35%-tinted border of their color,
with the light text (e.g. success: text `#8FD6AC`, bg `rgba(78,168,116,.14)`,
border `rgba(78,168,116,.35)`). Encoded in `StatusChip`.

## Typography — Instrument Sans (400/500/600/700)

| Variant | Size / weight |
| --- | --- |
| `h4` (stat numbers) | 27 / 700 / -0.01em |
| `h5` (page titles) | 17 / 600 |
| `subtitle1` (card titles) | 14.5 / 600 |
| `body1` | 13.5 |
| `body2` (meta) | 12.5 / `#9A968E` |
| `overline` | 11 / 0.12em / `#7C7972` |

Loaded via `next/font/google` (`--font-instrument`) in each app's layout.

## Radii, spacing, elevation

- Cards / panels — **14–16px**; inputs / rows — **11–12px**; buttons, chips,
  search — **pill (999px)**; modals — **20px**; page shell — **24px**.
- Card padding **18–20px**; grid gaps **14px**; section gaps **18–20px**;
  sidebar **248px**.
- **No shadows on cards** (borders instead). Modal shadow `0 30px 80px rgba(0,0,0,.6)`.

## `@recruit/ui` — theme only, no wrapper components

Following the `ai-recruiter-app` convention, `@recruit/ui` exports **only the
theme**. Every design look is a MUI `styleOverrides` or a custom `variant`
(registered via module augmentation) — you use **plain MUI** components:

| You write | You get |
| --- | --- |
| `<Button variant="contained">` | gradient primary (pill) |
| `<Button variant="outlined">` | subtle outline |
| `<Chip variant="soft" color="success">` | tinted status chip (per color) |
| `<Card variant="accent"\|"feature"\|"ghost"\|"interactive"\|"inset">` | surface family |
| `<Tabs>/<Tab>` | pill segmented control |
| `<Stepper>` · `<Alert>` · `<Pagination>` · `<Table>` · `<Dialog>` | restyled to the design |

MUI's `TextField`, `Switch`, `Checkbox`, `Slider`, `Avatar`, `LinearProgress`,
`Skeleton`, etc. inherit the theme with no extra work. Custom variants are
declared in [packages/ui/src/theme.ts](../packages/ui/src/theme.ts) via
`declare module "@mui/material/Chip"` / `"@mui/material/Paper"`.

## Icons

Material Symbols Rounded in the source design; we use `@mui/icons-material`
(rounded set) — e.g. dashboard `space_dashboard` → `SpaceDashboardRounded`,
AI `auto_awesome` → `AutoAwesomeRounded`, more `more_horiz` → `MoreHorizRounded`.
