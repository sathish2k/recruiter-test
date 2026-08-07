---
name: form-renderer
description: How to build config-driven forms with FormRenderer / FormModal / useModal — JSON-schema shape, widgets, validation, and the create-mutation flow. Use when adding any form, add/edit modal, or form field type.
---

# FormRenderer

Source: `packages/shared/src/components/forms/` (ajv + react-hook-form). One
folder per widget:

| widget | value | notes |
|---|---|---|
| `text` / `textarea` | string | `format: email` picks the input type |
| `number` | number | `minimum`/`maximum`/`step`/`unit` |
| `password` | string | reveal toggle + config-driven strength meter |
| `select` | string | searchable and/or API-backed via `optionSource` |
| `multiselect` | string[] | same sourcing, multiple values |
| `radio` | string | `row` for horizontal |
| `checkbox-group` | string[] | `columns` to grid it |
| `switch` | boolean | pill toggle |
| `switch-row` | boolean | title-left + toggle-right full-width row |
| `checkbox` | boolean | real square checkbox + label (compact) |
| `segmented` | string | pill tabs over a small `enum` |
| `chips` | string[] | free-text tags |
| `date` / `time` / `datetime` | ISO string | native picker, `min`/`max` |
| `color` | hex string | swatch + hex input |
| `phone` | string | dial-code picker; as-you-type formatting + per-country min/max length (libphonenumber-js), keyed to the selected code; `errorMessage.phone` for the invalid message |
| `upload` | `{ url, file }` | single-image preview tile, type/size limits |
| `attachments` | `Attachment[]` | multi-file dropzone (design animations); uploads on pick via an injected `uploader`, holds `{name,url,size,type}`; honors `accept` + `maxSizeMb` |
| `callout` | — | display-only accent card (`title`+`help`+`icon`); ignores the value; put in a `bare` section |
| `days` | string[] | day toggles + presets |
| `markdown` | string | Write/Preview, split toolbar |

Plus `form-renderer/`, `form-with-section-renderer/` and `field/` (the
dispatcher + `FieldShell`).

**Inference** when `widget` is omitted: `array`+`enum` → `checkbox-group`,
`array` → `chips`, `enum` → `select`, `number`/`integer` → `number`,
`boolean` → `switch`, `format: password` → `password`, `format: date` → `date`,
else `text`.

**Adding a widget**: write a component taking `WidgetProps`
(`{ name, prop, field, fieldState, t }`), render through `FieldShell` so label
and error styling match, add one line to `WIDGETS` in `field/field.tsx`, and
add the name to the `Widget` union in `types.ts`. Nothing else changes.

**Layout** — everything is MUI `Grid`/`Stack` via one helper (`form-container.tsx`):
`gridContainer` → `Grid`, else `Stack`. Same vocabulary at three levels:

```ts
<FormWithSectionsRenderer
  sectionsContainer={{ gridContainer: { spacing: 2 } }}   // sections side by side
  sections={[
    { title: "…", columns: 3, grid: { size: 6 },          // shorthand: even columns
      fields: ["a", "b", { name: "c", span: 3 }] },        //   `span` counts in them
    { title: "…", gridContainer: { columns: 12, spacing: 2 }, // engine-style: 12-col,
      fields: ["d", "e"] },                               //   grid.size on each prop
    { title: "…", stackContainer: { spacing: 1 }, fields: ["f"] },
  ]}
/>
```

`FormRenderer` takes the same `stackContainer` / `gridContainer`. A field places
itself with `grid: { size, offset }` on its **schema property** (responsive:
`grid: { size: { xs: 12, md: 6 } }`). Default everywhere is a plain stack.

**Two-column form (form column + side rail), config-driven — no `sidePanel`
needed.** A section can be a **group**: give it a `sections: [...]` child list
instead of `fields`; it stacks the children and takes its own `grid.size` slot
in the parent. Put two groups sized `md: 8` / `md: 4` inside a 12-col
`sectionsContainer` and they sit side by side on desktop, stack on mobile — the
whole layout is config, no hardcoded columns. (This is how the contact/client
Add forms lay out; `sidePanel` is legacy, used only by the profile screen for a
display-only ReactNode rail.)

- **Prefer per-field responsive `grid.size` over the `columns`/`span` shorthand**
  when matching a design pixel-for-pixel — e.g. `{ xs: 12, md: 6 }` (half),
  `{ xs: 12 }` (full), `{ xs: 12, md: 2 }` (a narrow prefix like salutation).
- **Spacer / deliberate gap**: a field entry whose `name` isn't a schema
  property renders an **empty grid cell** — e.g. `{ name: "spacer", grid: { size:
  { xs: 0, md: 6 } } }` leaves a half-width gap so the next pair stays on its own
  row. A `size: 0` at a breakpoint becomes `display: none` there (so the spacer
  vanishes on mobile) — this works for *any* field, not just spacers.
- **`bare: true` section** — skips the section `Card` chrome so a single display
  widget (a `callout`) draws its own container.
- **Required asterisk is automatic** — a field listed in `schema.required` shows
  a `*` on its label (via context); don't add it manually.

**Prefer `FormWithSectionsRenderer` for any multi-card settings/profile screen**
— don't hand-place `<Field>`s in bespoke `<Card>`s. Each `section` renders as a
themed `Card` (title/description/grid); screen-level props wire the rest:
`sidePanel` (a `ReactNode` right rail — e.g. a "Current workspace" summary),
`actionsPlacement: "header" | "footer"`, `onCancel`/`cancelLabel`,
`submitLabel`/`submitIcon`, and an optional `actions={({ isDirty, isSubmitting,
submit, reset, values }) => …}` render-prop when the button cluster is custom
(e.g. a sticky "unsaved changes" bar that only shows when `isDirty`). `onSubmit`
gets the full values — strip non-payload fields there (`upload` `{url,file}`
handled by uploading `file` first; read-only display fields). Reference:
`recruit-settings/src/workspace/workspace.component.tsx` and
`recruit-profile/src/profile-form/`.

**Read-only field**: set `readOnly: true` on the schema property (honored by the
`text` widget — renders disabled). Seed its value from the fetched record and
strip the key in `onSubmit` if the API rejects it. Example: the work-email field
in `recruit-profile/src/profile-form/profile-form.configuration.ts`.

**Loading state**: pass `isLoading` to `FormWithSectionsRenderer` while the
record loads — it renders a `Skeleton` mirroring the section/field layout
(cards, per-field skeletons that respect `columns`/`span`, upload → circle,
textarea → taller, plus a side-panel skeleton when `sidePanel` is set) instead
of returning `null`. Keep the schema/sections/sidePanel props populated (they're
static config) and gate on the fetch: `isLoading={isLoading || !data}`.

**Text**: every label, placeholder, help line, error and widget string resolves
through `t(key, fallback)` — schemas hold keys, never literals.
and `packages/shared/src/components/modal/` (`Modal`, `FormModal`, `useModal`).
Real schemas: `recruit-auth/src/sign-up/sign-up.configuration.ts` (validation,
formats, strength meter), `recruit-client/src/clients/clients.configuration.ts`
(`addForm`), `recruit-dashboard/src/toolbar/toolbar.configuration.ts`.

## Schema (lives in `*.configuration.ts`, text keys in `*.translations.json`)

```ts
addForm: {
  type: "object",
  properties: {
    title:  { type: "string", title: "fields.role", placeholder: "fields.rolePlaceholder", icon: "person" },
    email:  { type: "string", format: "email" },
    level:  { type: "string", title: "fields.level", enum: ["Junior", "Mid"] }, // → select
    active: { type: "boolean" },                                                // → switch
  },
  required: ["title"],
  errorMessage: { required: { title: "fields.roleRequired" } },
}
```

Widget resolution: explicit `widget` → `type: "array"` = chips (soft-Chip tags
+ "Add + Enter" input; value is `string[]`) → `enum` = select → `boolean` =
switch → `format: "password"` = password (optional `strengthMeter`) → else text.
Explicit widgets also include `segmented` (themed Tabs pill over `enum`) and
`markdown` (`markdown-editor.tsx`: Write/Preview tabs, formatting toolbar,
escaped inline preview via `markdownToHtml`; value is the raw markdown string).
Cross-field equality: `matchesField: "<field>"` + `errorMessage.matches` key.
`icon` is an `ICON_REGISTRY` name rendered via `IconRenderer` as the start adornment.
All `title`/`placeholder`/`help`/`errorMessage` values are translation keys.

## Validation & normalization

Field-level rules go in the **schema** (`required`, `maxLength`, `pattern`,
`format: "email"`, `enum`, `errorMessage.<keyword>` t-keys) — ajv-formats and
ajv-errors are registered, so those all fire. The resolver **strips empty
strings before ajv**, so `required` fails on a blank field (ajv `required` only
checks key presence) and optional blanks skip format/pattern checks — don't work
around this.

Rules ajv can't express **per-field** (at-least-one-of, "secondary ≠ primary")
go in the component's `onSubmit`: check the values, `show()` a toast, and
`return` to abort. **Normalization** (trim/lowercase email, E.164 phone, URL
canonicalization) belongs in the **backend service** (authoritative); do it
lightly on the client too if it aids UX. `attachments` uploads through the
**datasource**, injected into the widget: `widgets={{ attachments: (p) =>
<AttachmentsWidget {...p} uploader={(file, onProgress) => mut.uploadAsset(file,
onProgress)} /> }}` — the endpoint lives in the datasource, never the widget.

**Config style**: author a `*.configuration.ts` as one **inline exported object**
— no `half`/`grid12`/`dialCodes` helper consts, no separate `schema`/`sections`
locals. Keep the file `.ts` in the repo, but when **showing** a config to the
user, render it as a JSON code block. Reference:
`recruit-contact/src/contact-form/contact-form.configuration.ts`.

## Custom widgets (one-off escape hatch — mirrors the table's `cells`)

**The `widget` name IS the key**: any `widget` not handled by a built-in is
resolved from the `widgets` prop and called with the field context — exactly
how a table cell's `type` resolves from `cells`. A custom entry is checked
*before* the built-ins, so a screen can also override one locally.

```tsx
// schema — `brandPicker` is not a built-in widget
logo: { type: "string", widget: "brandPicker", title: "fields.logo" }

// renderer
<FormRenderer id={id} schema={schema} onSubmit={save}
  widgets={{ brandPicker: ({ field, prop, fieldState, t }) => (
    <FieldShell label={t(prop.title!)} error={fieldState.error?.message && t(fieldState.error.message)}>
      <MyPicker value={field.value} onChange={field.onChange} />
    </FieldShell>
  )}} />
```

`WidgetProps = { name, prop, field, fieldState, t }` — identical to every
built-in widget, so a custom one is fully form-bound: validation, dirty state,
and grid/`span` placement for free. Render through `FieldShell` to keep label +
error spacing consistent. `Widgets` lives entirely in the form layer (`Field`
resolves it before falling through to `WIDGETS`), and works the same on
`FormWithSectionsRenderer` and `FormModal`.

Like `cells`, a widget is **called as a plain function, not mounted as a
component** — so an inline arrow in the `widgets` literal is safe (as a
component type its identity would change every render and remount the field,
dropping input focus). The flip side is the same as the table's: it shares the
enclosing render's hook order, so don't swap widget keys conditionally.

If the look repeats, promote it to a real `forms/<name>/` folder + a line in
`WIDGETS` instead of leaving it inline.

## FormRenderer props

`{ id, schema, defaultValues?, onSubmit, submitLabel?, onCancel?, cancelLabel?, loading?, beforeSubmit?, widgets? }`
— `id` resolves every text key via `useTranslation(id)`.

## FormWithSectionsRenderer (sectioned page forms)

`form-with-sections.tsx` — one form (single `useForm` + ajv) rendered as titled
`Card variant="base"` sections with a page header (title/description left,
Cancel + submit buttons right). Extra props over FormRenderer:
`sections: [{ title?, description?, columns? (default 2), fields: (string | { name, span })[] }]`
(field names key into `schema.properties`; `span` stretches across columns),
`title`/`description` (page-heading t-keys), `submitIcon` (ICON_REGISTRY name),
`sidePanel` (ReactNode rendered in a 340px column beside the sections — the
design side panels; see `add-job-panel.tsx` / `add-candidate-panel.tsx`).
Reuses the exported `Field` — widgets/validation identical to FormRenderer.
Reference: `recruit-jobs/src/add-job/` (Basics 2-col + Description sections,
`routeId`-CTA entry from the Jobs table, `mutation.create` → back to Jobs).
Numeric-looking inputs (openings, salary) stay `type: "string"` in the schema —
convert in the component before `create` (ajv + number inputs don't mix).

## The add/edit modal flow (golden reference: clients.component.tsx)

```tsx
const addModal = useModal();                       // { isOpen, data, open(data?), close }
const { mutation, mutate } = useFetch(id);         // mutation = the datasource instance

const create = async (values: FormValues) => {
  await mutation.create?.(values);                 // datasource create → POST
  await mutate();                                  // revalidate the list
};

<TableFilterExportRenderer id={id} onCta={(a) => a === "add" && addModal.open()} />
{config.addForm ? (
  <FormModal open={addModal.isOpen} onClose={addModal.close} id={id}
    title={t("addForm.title")} description={t("addForm.description")}
    schema={config.addForm} submitLabel="addForm.submit" cancelLabel="cancel"
    onSubmit={create} />
) : null}
```

The datasource needs a `create` method (`httpClient.post(...)`) and the API a
matching `POST` route (Elysia `t.Object` body schema → controller → service).
`FormModal` closes itself after a successful submit (`closeOnSubmit` default true).
