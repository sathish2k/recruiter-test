"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import { useMemo } from "react";
import { type FieldValues, useForm } from "react-hook-form";
import { IconRenderer } from "../../renderers";
import { Field } from "../field/field";
import { buildResolver, defaultFor } from "../form-renderer/form-renderer";
import type { FormSectionField, FormValues, FormWithSectionsProps } from "../types";

const fieldName = (f: FormSectionField) => (typeof f === "string" ? f : f.name);
const fieldSpan = (f: FormSectionField) => (typeof f === "string" ? 1 : (f.span ?? 1));

export function FormWithSectionsRenderer({
  id,
  schema,
  sections,
  defaultValues,
  onSubmit,
  title,
  description,
  submitLabel = "submit",
  submitIcon,
  onCancel,
  cancelLabel = "cancel",
  loading = false,
  sidePanel,
  draftLabel = "saveDraft",
  onSaveDraft,
  actions,
  actionsPlacement = "header",
}: FormWithSectionsProps) {
  const { t } = useTranslation(id);
  const resolver = useMemo(() => buildResolver(schema), [schema]);
  const initial = useMemo(() => {
    const values: FieldValues = { ...defaultValues };
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (values[key] === undefined) values[key] = defaultFor(prop);
    }
    return values;
  }, [schema, defaultValues]);

  const { control, handleSubmit, getValues, reset, formState } = useForm<FieldValues>({
    resolver,
    defaultValues: initial,
    mode: "onTouched",
  });

  // Once a save succeeds the on-screen values become the new baseline, so the
  // form stops reporting itself dirty (what keeps a save bar on screen).
  // Reset from getValues(), not the submitted payload — the resolver strips
  // empty optional fields, and resetting to that would re-dirty every one.
  const submitHandler = async (values: FieldValues) => {
    await onSubmit(values as FormValues);
    reset(getValues());
  };

  // A caller-supplied cluster gets everything it needs to drive the form.
  const actionsNode = actions?.({
    isDirty: formState.isDirty,
    isSubmitting: formState.isSubmitting,
    submit: () => void handleSubmit(submitHandler)(),
    reset: () => reset(initial),
    values: getValues(),
  });

  const defaultActions = (
    <Box sx={{ display: "flex", gap: "8px", flex: "none" }}>
      {onCancel ? (
        <Button variant="outlined" onClick={onCancel} sx={{ fontWeight: 400 }}>
          {t(cancelLabel)}
        </Button>
      ) : null}
      {onSaveDraft ? (
        <Button
          variant="outlined"
          onClick={() => onSaveDraft(getValues())}
          sx={{ fontWeight: 400 }}
        >
          {t(draftLabel)}
        </Button>
      ) : null}
      <Button
        type="submit"
        variant="contained"
        loading={loading || formState.isSubmitting}
        startIcon={submitIcon ? <IconRenderer name={submitIcon} size={16} /> : null}
      >
        {t(submitLabel)}
      </Button>
    </Box>
  );

  const cluster = actionsNode ?? defaultActions;

  return (
    <Box component="form" onSubmit={handleSubmit(submitHandler)} noValidate>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          mb: "18px",
        }}
      >
        <Box>
          {title ? (
            <Typography sx={{ fontSize: 21, fontWeight: 700, letterSpacing: "-.01em" }}>
              {t(title)}
            </Typography>
          ) : null}
          {description ? (
            <Typography sx={{ fontSize: 13, color: "text.secondary", mt: "4px" }}>
              {t(description)}
            </Typography>
          ) : null}
        </Box>
        {actionsPlacement === "header" ? cluster : null}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: sidePanel ? "8fr 4fr" : "1fr",
          gap: "16px",
          alignItems: "start",
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {sections.map((section, si) => (
            <Card
              key={section.title ?? si}
              variant="base"
              sx={{
                p: "22px 24px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              {section.title ? (
                <Box>
                  <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t(section.title)}</Typography>
                  {section.description ? (
                    <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "2px" }}>
                      {t(section.description)}
                    </Typography>
                  ) : null}
                </Box>
              ) : null}
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: `repeat(${section.columns ?? 2}, 1fr)`,
                  gap: "14px",
                }}
              >
                {section.fields.map((f) => {
                  const name = fieldName(f);
                  const prop = schema.properties[name];
                  if (!prop) return null;
                  return (
                    <Box key={name} sx={{ gridColumn: `span ${fieldSpan(f)}` }}>
                      <Field name={name} prop={prop} control={control} t={t} />
                    </Box>
                  );
                })}
              </Box>
            </Card>
          ))}
        </Box>
        {sidePanel ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>{sidePanel}</Box>
        ) : null}
      </Box>

      {actionsPlacement === "footer" ? cluster : null}
    </Box>
  );
}
