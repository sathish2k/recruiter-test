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

**Layout**: `FormRenderer` takes `stackContainer` / `gridContainer` exactly like
a page Configuration does; with a grid, each field places itself via
`grid: { size, offset }` in its schema property. Default is a plain stack.

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

## FormRenderer props

`{ id, schema, defaultValues?, onSubmit, submitLabel?, onCancel?, cancelLabel?, loading?, beforeSubmit? }`
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
