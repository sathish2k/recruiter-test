"use client";

import { ajvResolver } from "@hookform/resolvers/ajv";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useTranslation } from "@recruit/sdk";
import { isPossiblePhoneNumber } from "libphonenumber-js/max";
import { useMemo } from "react";
import { type FieldValues, FormProvider, type Resolver, useForm } from "react-hook-form";
import { hiddenFields } from "../conditions";
import { Field } from "../field/field";
import { useFieldEffects } from "../field/use-field-effects";
import { FormContainer } from "../form-container";
import type { FormRendererProps, JsonSchema, JsonSchemaProperty } from "../types";

/** Error key/message for a phone field, from its schema `errorMessage`. */
function phoneErrorMessage(prop: JsonSchemaProperty): string {
  const em = prop.errorMessage;
  if (typeof em === "string") return em;
  if (em && typeof em === "object") {
    return em.phone ?? em.pattern ?? em.format ?? "Enter a valid phone number";
  }
  return "Enter a valid phone number";
}

/**
 * Per-country phone validation: the stored value is `+<code> <national>`, so the
 * national part (after the first space) tells us whether a number was entered at
 * all, and `isPossiblePhoneNumber` enforces that country's expected length
 * dynamically. Empty (code-only) values pass — `required` handles those.
 */
function phoneProblem(value: unknown): boolean {
  if (typeof value !== "string" || !value.trim()) return false;
  const spaceIndex = value.indexOf(" ");
  const national = spaceIndex >= 0 ? value.slice(spaceIndex + 1) : "";
  if (national.replace(/\D/g, "").length === 0) return false;
  return !isPossiblePhoneNumber(value);
}

export function defaultFor(prop: JsonSchemaProperty): unknown {
  if (prop.widget === "upload") return { url: prop.default ?? "" };
  if (prop.default !== undefined) return prop.default;
  if (prop.type === "array") {
    // A repeater the design opens on one blank row seeds that row here rather
    // than from an effect, so it lands exactly once.
    if (prop.startEmptyRow && prop.itemSchema) {
      return [
        Object.fromEntries(
          Object.entries(prop.itemSchema).map(([key, item]) => [
            key,
            item.type === "boolean" ? false : "",
          ]),
        ),
      ];
    }
    return [];
  }
  if (prop.type === "boolean") return false;
  return "";
}

/**
 * Drop empty-string fields before ajv runs. ajv `required` only checks that a
 * key is *present*, so an empty required field (`""`) would otherwise pass —
 * removing it makes `required` fail (and lets optional empties skip
 * format/pattern checks). Booleans/arrays aren't `""`, so they're untouched.
 */
function stripEmptyOptional(_schema: JsonSchema, values: FieldValues): FieldValues {
  const cleaned: FieldValues = { ...values };
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === "") delete cleaned[key];
  }
  return cleaned;
}

/**
 * On a scalar, `enum` constrains the value. On an array or an object it lists
 * the *choices a widget offers* (see widgetFor, and the pickers that read
 * `prop.enum`) — but ajv reads a sibling `enum` as a constraint on the whole
 * value, so those fields would always fail with "must be equal to one of the
 * allowed values". Move it onto `items` for arrays, and drop it for objects,
 * where the widget owns the shape.
 *
 * An array of *objects* (a repeater, or any widget with an `itemSchema`) is the
 * third case: pushing `enum` onto its items would demand every row be one of
 * those strings, and the form would refuse to submit with no visible error.
 * Those widgets take their options from `choices`; drop `enum` outright.
 */
function forValidation(schema: JsonSchema): JsonSchema {
  const properties: JsonSchema["properties"] = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.enum && prop.type === "array") {
      properties[key] = prop.itemSchema
        ? { ...prop, enum: undefined }
        : { ...prop, enum: undefined, items: { ...prop.items, enum: prop.enum } };
    } else if (prop.enum && prop.type === "object") {
      properties[key] = { ...prop, enum: undefined };
    } else {
      properties[key] = prop;
    }
  }
  return { ...schema, properties };
}

export function buildResolver(schema: JsonSchema): Resolver<FieldValues> {
  const base = ajvResolver(forValidation(schema) as never, { strict: false });
  return async (rawValues, context, options) => {
    // A condition-hidden field must not validate or reach the payload — drop its
    // value before ajv sees it.
    const hidden = hiddenFields(schema, rawValues);
    const values = stripEmptyOptional(schema, rawValues);
    for (const key of hidden) delete values[key];
    const result = await base(values, context, options);
    const errors = { ...result.errors };
    for (const key of hidden) delete errors[key];
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (errors[key] || hidden.has(key)) continue;
      if (prop.matchesField && values[key] && values[key] !== values[prop.matchesField]) {
        errors[key] = {
          type: "matches",
          message:
            typeof prop.errorMessage === "object" ? prop.errorMessage.matches : prop.errorMessage,
        };
      } else if (prop.widget === "phone" && phoneProblem(values[key])) {
        errors[key] = { type: "phone", message: phoneErrorMessage(prop) };
      }
    }
    return Object.keys(errors).length
      ? { values: {}, errors }
      : { values: result.values ?? values, errors: {} };
  };
}

export function FormRenderer({
  id,
  schema,
  defaultValues,
  onSubmit,
  submitLabel = "submit",
  onCancel,
  cancelLabel = "cancel",
  loading = false,
  beforeSubmit,
  stackContainer,
  gridContainer,
  widgets,
  wrapFields,
  actions,
}: FormRendererProps) {
  const { t } = useTranslation(id);
  const resolver = useMemo(() => buildResolver(schema), [schema]);
  const initial = useMemo(() => {
    const values: FieldValues = { ...defaultValues };
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (values[key] === undefined) values[key] = defaultFor(prop);
    }
    return values;
  }, [schema, defaultValues]);

  const form = useForm<FieldValues>({
    resolver,
    defaultValues: initial,
    mode: "onTouched",
  });
  const { control, handleSubmit, formState, setValue, reset, getValues } = form;
  const { hiddenSet, disabledSet } = useFieldEffects(schema, control, setValue);

  const requiredFields = new Set(schema.required ?? []);
  // Drop condition-hidden fields so their grid cell collapses (no gap).
  const visible = Object.entries(schema.properties).filter(([name]) => !hiddenSet.has(name));
  const fields = visible.map(([fieldName, prop]) => (
    <Field
      key={fieldName}
      name={fieldName}
      prop={requiredFields.has(fieldName) ? { ...prop, required: true } : prop}
      control={control}
      t={t}
      widgets={widgets}
      disabled={disabledSet.has(fieldName)}
    />
  ));

  const body = (
    <FormContainer
      stackContainer={stackContainer}
      gridContainer={gridContainer}
      grids={visible.map(([, prop]) => prop.grid)}
    >
      {fields}
    </FormContainer>
  );

  // Widgets that manage their own sub-records (repeater, facts) reach the form
  // through context rather than props, so both renderers must provide it —
  // otherwise those widgets only work inside the sections renderer.
  return (
    <FormProvider {...form}>
      <Box component="form" onSubmit={handleSubmit((data) => onSubmit(data))} noValidate>
        {wrapFields ? wrapFields(body) : body}
        {actions ? (
          actions({
            isDirty: formState.isDirty,
            isSubmitting: loading || formState.isSubmitting,
            submit: () => void handleSubmit((data) => onSubmit(data))(),
            reset: () => reset(initial),
            values: getValues(),
          })
        ) : (
          <Stack spacing={1.5} sx={{ mt: fields.length ? "12px" : 0 }}>
            {beforeSubmit}
            {onCancel ? (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  pt: "16px",
                }}
              >
                <Button variant="outlined" onClick={onCancel} sx={{ px: "18px", fontSize: 12.5 }}>
                  {t(cancelLabel)}
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  loading={loading || formState.isSubmitting}
                  sx={{ px: "20px", fontSize: 12.5, fontWeight: 700 }}
                >
                  {t(submitLabel)}
                </Button>
              </Box>
            ) : (
              <Button
                type="submit"
                variant="contained"
                fullWidth
                loading={loading || formState.isSubmitting}
                sx={{
                  borderRadius: "12px",
                  py: "14px",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                {t(submitLabel)}
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </FormProvider>
  );
}
