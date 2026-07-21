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
| `switch` / `checkbox` | boolean | single toggle |
| `segmented` | string | pill tabs over a small `enum` |
| `chips` | string[] | free-text tags |
| `date` / `time` / `datetime` | ISO string | native picker, `min`/`max` |
| `color` | hex string | swatch + hex input |
| `phone` | string | dial-code picker, `optionSource` for codes |
| `upload` | `{ url, file }` | preview tile, type/size limits |
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

**Layout** — same vocabulary as a page Configuration, at three levels:

```ts
<FormWithSectionsRenderer
  sectionsContainer={{ gridContainer: { spacing: 2 } }}   // sections side by side
  sections={[
    { title: "…", columns: 3, grid: { size: 6 },          // shorthand: even columns
      fields: ["a", "b", { name: "c", span: 3 }] },        //   `span` counts in them
    { title: "…", gridContainer: { spacing: 2 },          // engine-style: 12-col,
      fields: ["d", "e"] },                               //   size on the schema prop
    { title: "…", stackContainer: { spacing: 1 }, fields: ["f"] },
  ]}
/>
```

`FormRenderer` takes the same `stackContainer` / `gridContainer`. A field places
itself with `grid: { size, offset }` on its schema property. Default everywhere
is a plain stack.

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
