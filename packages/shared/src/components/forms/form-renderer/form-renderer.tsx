"use client";

import { ajvResolver } from "@hookform/resolvers/ajv";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import { useTranslation } from "@recruit/sdk";
import { useMemo } from "react";
import { type FieldValues, type Resolver, useForm } from "react-hook-form";
import { Field } from "../field/field";
import { FormContainer } from "../form-container";
import type { FormRendererProps, JsonSchema, JsonSchemaProperty } from "../types";

export function defaultFor(prop: JsonSchemaProperty): unknown {
  if (prop.widget === "upload") return { url: prop.default ?? "" };
  if (prop.default !== undefined) return prop.default;
  if (prop.type === "array") return [];
  if (prop.type === "boolean") return false;
  return "";
}

function stripEmptyOptional(schema: JsonSchema, values: FieldValues): FieldValues {
  const required = new Set(schema.required ?? []);
  const cleaned: FieldValues = { ...values };
  for (const key of Object.keys(cleaned)) {
    if (cleaned[key] === "" && !required.has(key)) delete cleaned[key];
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
 */
function forValidation(schema: JsonSchema): JsonSchema {
  const properties: JsonSchema["properties"] = {};
  for (const [key, prop] of Object.entries(schema.properties)) {
    if (prop.enum && prop.type === "array") {
      properties[key] = { ...prop, enum: undefined, items: { ...prop.items, enum: prop.enum } };
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
    const values = stripEmptyOptional(schema, rawValues);
    const result = await base(values, context, options);
    const errors = { ...result.errors };
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (!prop.matchesField || errors[key]) continue;
      if (values[key] && values[key] !== values[prop.matchesField]) {
        errors[key] = {
          type: "matches",
          message:
            typeof prop.errorMessage === "object" ? prop.errorMessage.matches : prop.errorMessage,
        };
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

  const { control, handleSubmit, formState } = useForm<FieldValues>({
    resolver,
    defaultValues: initial,
    mode: "onTouched",
  });

  const fields = Object.entries(schema.properties).map(([fieldName, prop]) => (
    <Field key={fieldName} name={fieldName} prop={prop} control={control} t={t} widgets={widgets} />
  ));

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <FormContainer
        stackContainer={stackContainer}
        gridContainer={gridContainer}
        grids={Object.values(schema.properties).map((prop) => prop.grid)}
      >
        {fields}
      </FormContainer>
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
    </Box>
  );
}
