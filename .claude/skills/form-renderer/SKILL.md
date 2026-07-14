---
name: form-renderer
description: How to build config-driven forms with FormRenderer / FormModal / useModal — JSON-schema shape, widgets, validation, and the create-mutation flow. Use when adding any form, add/edit modal, or form field type.
---

# FormRenderer

Source: `packages/shared/src/components/form-renderer/` (ajv + react-hook-form)
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
