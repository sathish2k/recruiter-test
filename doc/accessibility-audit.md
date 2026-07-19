# Accessibility Audit — AI Recruiter

**Scope:** Static source-code audit of the front-end (`packages/shared`, `packages/modules`, `packages/recruit-sdk`, `apps/web`)
**Standard:** WCAG 2.2 Level AA
**Stack:** Next.js 16 · React 19 · MUI 9 (dark theme) · react-hook-form + AJV · i18next
**Date:** 15 July 2026
**Method:** Manual review of the design system (theme, renderers, form/table/filter/modal primitives, app shell) plus pattern analysis across ~119 TSX files and programmatic contrast calculation. No live/axe scan was run.

---

## Executive summary

The application is built on MUI, so it inherits solid accessibility defaults in a few places (semantic tables, focus-trapped menus/dialogs, `lang="en"`, `<main>`/`<aside>` landmarks, form error text wired through `aria-describedby`). However, the custom design-system layer that sits on top of MUI re-implements several interactive controls as plain `<div>`/`<Box>` elements and detaches labels from inputs. The result is that **core flows — logging in, filling forms, navigating between pages, filtering tables, and moving pipeline cards — are partially or wholly unusable with a keyboard or screen reader.**

The issues are systemic rather than one-off: because they live in shared primitives (`form-renderer`, `sidenav`, the filter widgets, the theme), a single fix propagates to every screen. That is good news for remediation effort.

Headline problems:

- **Form fields have no programmatic label.** The visible label is a detached `<Typography>` and the input uses `hiddenLabel` with no `aria-label`. Every text/select/password field in the app is announced as unlabeled.
- **Primary navigation is mouse-only.** Sidenav items and the account-menu avatar are clickable `<div>`s — not focusable or operable by keyboard, with no role.
- **Custom radio/checkbox filters are fake.** They render clickable boxes with no real input, no `role`, no `aria-checked`, and no keyboard support.
- **The primary orange call-to-action button fails colour contrast** (white on the orange gradient ≈ 3.06:1, and 2.35:1 on hover — AA requires 4.5:1).
- **No semantic headings exist anywhere** (zero `<h1>`–`<h6>`), so screen-reader users have no document outline.

### Findings by severity

| Severity | Count |
|---|---|
| Critical | 3 |
| Serious | 8 |
| Moderate | 9 |
| Minor | 4 |

"Critical" = blocks a core task for keyboard or screen-reader users. "Serious" = major barrier with a workaround or limited to part of a flow. "Moderate" = meaningful barrier or clear AA failure. "Minor" = best-practice / AAA / polish.

---

## Critical

### C1 — Form inputs have no programmatic label
**WCAG:** 1.3.1 Info & Relationships, 3.3.2 Labels or Instructions, 4.1.2 Name, Role, Value
**Where:** `packages/shared/src/components/form-renderer/form-renderer.tsx` — `FieldLabel` (≈L104) and every `TextField` (≈L250, L290)

`FieldLabel` renders a standalone `<Typography>` with no `htmlFor` / `id` association. The field itself is rendered with `hiddenLabel` and **no** `label`, `aria-label`, or `aria-labelledby`:

```tsx
export function FieldLabel({ label, hide }) {
  return <Typography sx={{...}}>{label}</Typography>;   // detached text, no association
}
// ...
<TextField {...field} hiddenLabel placeholder={...} />   // no accessible name
```

A screen reader announces these as "edit text, blank". Because `FormRenderer` drives sign-in, sign-up, reset-password, add-candidate, add-job, settings, etc., **this affects essentially every form in the product.** This is the single highest-impact issue.

**Fix:** Give each field a real accessible name. Simplest: pass MUI's `label` prop (and drop `hiddenLabel`) so MUI renders and associates a `<label>`. If the current visual design must be preserved, give `FieldLabel` an `id` and set `slotProps={{ htmlInput: { 'aria-labelledby': labelId } }}` on the field. Apply the same to the chips `InputBase`, the markdown editor, and the segmented control.

### C2 — Primary navigation items are non-focusable `<div>`s
**WCAG:** 2.1.1 Keyboard, 4.1.2 Name, Role, Value, 2.4.4 Link Purpose
**Where:** `packages/modules/recruit-core/src/sidenav/sidenav.component.tsx` (≈L84 nav items)

```tsx
<Box onClick={() => router.push(item.routeId)} sx={{ cursor: "pointer", ... }}>
  <IconRenderer name={item.icon} /> {t(item.label)}
</Box>
```

Each nav link is a `<Box>` (renders `<div>`). It has no `tabindex`, no `role`, and no key handler, so a keyboard user cannot focus or activate it, and a screen reader does not expose it as a link. The active item is also indicated by colour/weight only, with no `aria-current`. **A keyboard-only user cannot move between pages.**

**Fix:** Render each item as a real link — `<Link component={NextLink} href=...>` (or a `<Button>`/`<MenuItem>`). Add `aria-current="page"` to the active item. This also fixes 2.4.7 (focus visible) for the nav.

### C3 — Custom radio & checkbox filters are inaccessible
**WCAG:** 1.3.1, 2.1.1 Keyboard, 4.1.2 Name, Role, Value
**Where:** `packages/shared/src/components/filters/components/radio-filter.tsx`, `checkbox-filter.tsx`

Both build option rows from clickable `<Box>`s with a purely visual dot/checkmark — no `<input>`, no `role="radio"`/`"checkbox"`, no `aria-checked`, no group semantics, no keyboard handling:

```tsx
<Box onClick={() => onChange(option.value)} sx={optionRowSx(active)}>
  <Box sx={{ /* fake radio circle */ }}>{active ? <Box .../> : null}</Box>
  {option.label}
</Box>
```

Screen readers see plain text; keyboard users can't operate them. Table/data filtering is therefore keyboard-inaccessible.

**Fix:** Use MUI `RadioGroup`/`Radio` and `FormGroup`/`Checkbox` (they carry the correct roles, `aria-checked`, and arrow-key/space handling), styled to match. If keeping the custom look, add `role="radiogroup"`/`role="group"` on the container and `role="radio"`/`"checkbox"` + `aria-checked` + `tabIndex` + `onKeyDown` (Space/Enter, and arrow keys for radios) on each row.

---

## Serious

### S1 — No semantic headings / document outline
**WCAG:** 1.3.1 Info & Relationships, 2.4.6 Headings and Labels
**Where:** app-wide. `packages/shared/src/components/renderers/text-renderer.tsx` forces `component="span"`; grep found **zero** `variant="h1..h6"` or `component="h1..h6"` usages. Page titles (e.g. `appbar.component.tsx` L74, `modal.tsx` L48) are plain `<Typography>`/`<span>`.

There is no `<h1>` on any page and no heading hierarchy, so screen-reader users lose the primary means of scanning and navigating a page.

**Fix:** Render page/section titles as real headings (`Typography component="h1"|"h2"...` or the `variant` heading mapping). Give each route one `<h1>` (the appbar title is the natural candidate) and nest section headings beneath it.

### S2 — Account-menu trigger (avatar) is a clickable `<div>`
**WCAG:** 2.1.1 Keyboard, 4.1.2 Name, Role, Value
**Where:** `packages/modules/recruit-core/src/appbar/appbar.component.tsx` (≈L88 `<Avatar onClick=...>`)

The avatar opens the profile/logout menu but is a non-interactive element (only `title` + `cursor:pointer`). Keyboard users can't reach logout; the control has no button role/name.

**Fix:** Wrap the avatar in an `<IconButton aria-label={t('account')}>` (or `Button`) with `aria-haspopup="menu"` and `aria-expanded`.

### S3 — Icon-only buttons without accessible names
**WCAG:** 4.1.2 Name, Role, Value, 2.4.4 Link Purpose
**Where (representative):**
`packages/shared/src/components/renderers/actions-renderer.tsx` L55 (row action buttons), `modal.tsx` L55 (dialog close), `toast/toast.tsx` L71 (toast close), `form-renderer.tsx` L340 (password show/hide), `appbar.component.tsx` L138 (notifications), `upcoming-interviews`, `hiring`, `candidate-detail`, `add-job-panel`, `ai-screening`, etc.

Of ~53 `IconButton` usages, only a handful carry `aria-label`. MUI icons are `aria-hidden` by default, so an icon-only button with no label is announced as just "button". Some rely on `title=` (e.g. markdown toolbar, `lead-cv-queue`) which is unreliable — not surfaced on keyboard focus or touch and inconsistently read by AT.

**Fix:** Add a translated `aria-label` to every icon-only control (`aria-label={t('close')}`, `t('delete')`, `t('notifications')`, show/hide password, etc.). Prefer `aria-label` over `title` for the accessible name.

### S4 — Clickable table rows are not keyboard operable
**WCAG:** 2.1.1 Keyboard
**Where:** `packages/shared/src/components/table-renderer/table-row.tsx` (≈L30, `<TableRow onClick=...>` when `rowRouteId` is set)

Row navigation is mouse-only; there is no `tabindex`/`role`/key handler, so keyboard users can't open a record from the table.

**Fix:** Make the row's primary cell a real link (recommended — gives free keyboard + "open in new tab"), or add `tabIndex={0}`, `role="link"`/`"button"`, and an Enter/Space `onKeyDown` to the row.

### S5 — Kanban drag-and-drop has no keyboard or single-pointer alternative
**WCAG:** 2.1.1 Keyboard, 2.5.7 Dragging Movements (AA, WCAG 2.2)
**Where:** `packages/modules/recruit-pipeline/src/pipeline/pipeline.component.tsx` (HTML5 `draggable`/`onDragStart`/`onDragOver`/`onDrop`, ≈L90, L253, L513)

Moving a candidate between pipeline stages requires a mouse drag. There is no keyboard path and no click/menu alternative to change stage. (Card *open* is clickable, but *move* is not.)

**Fix:** Add a non-drag way to change stage — e.g. a "Move to…" menu on each card (reuse `ActionsMenu`) — and/or a keyboard-operable DnD library (`@dnd-kit` with its keyboard sensor).

### S6 — Primary button text fails colour contrast
**WCAG:** 1.4.3 Contrast (Minimum)
**Where:** `packages/ui/src/theme.ts` — `MuiButton` contained/primary gradient `#FF8A3C → #E4560F`, `contrastText:#FFFFFF`, 13px text

Measured contrast of white text on the gradient: **3.06:1** on `#F26A1B`, **3.73:1** on the dark end `#E4560F`, and **2.35:1** on the light hover `#FF8A3C`. AA requires 4.5:1 for this text size. The main CTA across the app is below threshold.

**Fix:** Darken the gradient (e.g. base around `#C2470A`/`#B23E08`) or use a darker text colour on the button. Verify the chosen combination reaches ≥4.5:1, including the hover state.

### S7 — Dialogs/modals are not labelled
**WCAG:** 4.1.2 Name, Role, Value, 1.3.1 Info & Relationships
**Where:** `packages/shared/src/components/modal/modal.tsx`

The MUI `Dialog` has no `aria-labelledby`/`aria-describedby`; the title is a plain `<Typography>` (no `id`) and the close `IconButton` (L55) has no `aria-label`. Screen readers open the dialog without announcing what it is.

**Fix:** Give the title an `id` and pass `aria-labelledby={titleId}` (and `aria-describedby={descId}` when a description exists) to `Dialog`; add `aria-label={t('close')}` to the close button.

### S8 — Native date/number filter inputs remove the focus outline and have no label
**WCAG:** 2.4.7 Focus Visible, 1.3.1, 3.3.2 Labels or Instructions
**Where:** `filter-popover.tsx` `DARK_INPUT_STYLE` (`outline:"none"`, L78) used by `date-filter.tsx`, `daterange-filter.tsx`, `range-filter.tsx`

Raw `<input type="date"/number>` elements are styled with `outline:"none"` and no replacement focus ring, and have no associated `<label>` (only a popover trigger button). Keyboard users lose the focus indicator; screen-reader users get no field name.

**Fix:** Remove `outline:"none"` (or add a visible `:focus-visible` style — e.g. a 2px accent ring), and add `aria-label` (from/to, min/max) to each input.

---

## Moderate

### M1 — Search field is labelled only by placeholder
**WCAG:** 1.3.1, 3.3.2, 4.1.2 — `packages/shared/src/components/filters/components/search-filter.tsx` (`InputBase` with `placeholder` only). Add `inputProps={{ 'aria-label': t('search') }}`. Placeholder text also disappears on input and is low-contrast (see M4).

### M2 — No status-message live regions
**WCAG:** 4.1.3 Status Messages — grep found **zero** `aria-live`/`role="status"`/`role="alert"`. Toasts (`toast/toast.tsx`) and async form results are not announced. Wrap the toast content in `role="status" aria-live="polite"` (assertive for errors), and announce submit success/failure.

### M3 — Segmented control uses tab semantics for a form value
**WCAG:** 4.1.2 — `form-renderer.tsx` "segmented" widget renders `Tabs`/`Tab` (tablist/tab roles) to pick a field value. AT users hear "tab" for what is really a single-select. Use a `RadioGroup` (or `ToggleButtonGroup` with `aria-label`) styled as a segmented control.

### M4 — Secondary / hint / placeholder text fails AA contrast
**WCAG:** 1.4.3 — `text.disabled #7C7972` measures **3.93:1** on paper and **4.24:1** on the input background; used for placeholders, hints, sidenav group titles, and `overline`. Below 4.5:1 for this (small) text size. Lighten to ≈`#9A968E` or darker-background equivalent so it clears 4.5:1. (Body/secondary `#9A968E` text already passes at ~5.8:1.)

### M5 — No "skip to main content" link
**WCAG:** 2.4.1 Bypass Blocks — no skip link in `apps/web/src/app/layout.tsx` or the core layout. Keyboard users must tab through the full sidenav on every page. Add a visually-hidden-until-focused skip link targeting the `<main>` in `mui-core-layout.tsx`.

### M6 — Charts likely lack a text alternative
**WCAG:** 1.1.1 Non-text Content — ApexCharts (`react-apexcharts`) is used in `graph-renderer`/dashboard funnels/KPIs. SVG charts are typically opaque to AT. Provide a caption/summary or an equivalent data table (and `aria-label` on the chart container). *Verify per chart.*

### M7 — Multiple unnamed `<nav>` landmarks
**WCAG:** 1.3.1 / 2.4.1 — `sidenav.component.tsx` renders `component="nav"` **once per group**, producing several `<nav>` landmarks with no distinguishing name. Use a single `<nav aria-label={t('primary')}>` around all groups (groups become `<ul>`/`role="group"` with a heading).

### M8 — `IconRenderer` image `alt` defaults to empty
**WCAG:** 1.1.1 — `icon-renderer.tsx` renders `<Box component="img" alt={alt='' }>`; any meaningful image passed via `src` (logos, avatars) defaults to decorative and is dropped by AT. Require/propagate a meaningful `alt` when the image conveys information.

### M9 — Chips input & delete affordance in forms
**WCAG:** 1.3.1 / 4.1.2 — `form-renderer.tsx` chips widget: the `InputBase` has no label association and the `Chip onDelete` control may lack a per-chip accessible name (e.g. "Remove React"). Associate the label and set an `aria-label` on the delete action.

---

## Minor / best-practice

### L1 — Active nav/tab state relies on colour + weight only
**WCAG:** 1.4.1 Use of Colour — add `aria-current`/`aria-selected` (partly covered by C2). MUI `Tabs` already sets `aria-selected`; the sidenav does not.

### L2 — Notification "unread" indicated by a colour dot only
**WCAG:** 1.4.1 / 1.1.1 — `appbar.component.tsx` badge dot (L146) has no text equivalent. Add `aria-label` such as `t('notificationsUnread')` or a visually-hidden count.

### L3 — No `prefers-reduced-motion` handling
**WCAG:** 2.3.3 Animation from Interactions (AAA — advisory) — card hover `translateY`, transitions, and toast motion don't respect reduced-motion. Gate non-essential motion behind `@media (prefers-reduced-motion: reduce)`.

### L4 — Hard-coded English accessible name
`actions-menu.tsx` L72 uses `aria-label="actions"` (untranslated) while the app is otherwise i18n-driven. Route it through `t()` so AT users on non-English locales get a localised name.

---

## What's already good

- `lang="en"` is set on `<html>` (`apps/web/src/app/layout.tsx`).
- Tables use **semantic** MUI `Table`/`TableHead`/`TableCell` markup, so header cells render as `<th scope="col">` and sortable headers use `TableSortLabel`.
- `<main>` and `<aside>` landmarks exist (`mui-core-layout.tsx`, `sidenav.component.tsx`).
- MUI `Menu`, `Dialog`, and `Popover` provide focus trapping, focus return, and Escape-to-close for free.
- Form **validation errors** are wired correctly: `TextField` `helperText` + `error` give `aria-describedby` and `aria-invalid` on text/select fields.
- External links get `rel="noopener noreferrer"` and `target` handling (`link-renderer.tsx`).
- Most body text and all "soft" status chips comfortably pass AA contrast (5.6:1–8.1:1).
- Switch/checkbox form widgets use `FormControlLabel`, which associates the label correctly.

---

## Suggested remediation order

1. **C1 form labels** and **C2 sidenav links** — highest impact, both are single shared-component fixes.
2. **C3 filter controls**, **S2 avatar button**, **S3 icon-button labels** — swap to semantic MUI components / add `aria-label`.
3. **S6/M4 contrast** — a theme-only change (button gradient + `text.disabled`).
4. **S1 headings**, **S7 dialog labelling**, **S4 table rows**, **S8 focus outline** — structural but localized.
5. **S5 kanban**, **M2 live regions**, **M3 segmented**, **M5 skip link**, **M6 charts** — larger or feature-specific.
6. Minor items and an automated pass (axe-core / Playwright + `@axe-core/playwright`) wired into the existing e2e suite to catch regressions.

*This is a static code review; it catches structural and code-level issues but not everything a live assistive-technology test would (e.g. focus-order glitches, reading order, real screen-reader output). A follow-up axe scan + manual keyboard/VoiceOver pass on the running app is recommended before claiming conformance.*
