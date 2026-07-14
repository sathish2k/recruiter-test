"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { ajvResolver } from "@hookform/resolvers/ajv";
import { useTranslation } from "@recruit/sdk";
import { useMemo, useState } from "react";
import { IconRenderer } from "../renderers";
import {
  type Control,
  Controller,
  type FieldValues,
  useForm,
} from "react-hook-form";
import type {
  FormRendererProps,
  JsonSchemaProperty,
  PasswordStrengthConfig,
  Widget,
} from "./types";

const DEFAULT_STRENGTH: Required<PasswordStrengthConfig> = {
  rules: ["^.{8,}$", "[A-Z]", "[0-9]"],
  labels: ["Weak", "Okay", "Strong"],
  colors: ["#E05B5B", "#D69B3C", "#4EA874"],
};

// Resolve a field's strengthMeter (true | config | falsy) to a full config.
function resolveStrength(
  strengthMeter: JsonSchemaProperty["strengthMeter"],
): Required<PasswordStrengthConfig> | null {
  if (!strengthMeter) return null;
  return strengthMeter === true
    ? DEFAULT_STRENGTH
    : { ...DEFAULT_STRENGTH, ...strengthMeter };
}

function widgetFor(prop: JsonSchemaProperty): Widget {
  if (prop.widget) return prop.widget;
  if (prop.enum) return "select";
  if (prop.type === "boolean") return "switch";
  if (prop.format === "password") return "password";
  return "text";
}

function StrengthMeter({
  value,
  config,
  t,
}: {
  value: string;
  config: Required<PasswordStrengthConfig>;
  t: (key: string, fallback?: string) => string;
}) {
  const score = value
    ? config.rules.reduce((n, r) => (new RegExp(r).test(value) ? n + 1 : n), 0)
    : 0;
  const color =
    config.colors[score - 1] ?? config.colors[config.colors.length - 1];
  const levels = config.rules.map((_, i) => i + 1);

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
      {levels.map((level) => (
        <Box
          key={level}
          sx={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            bgcolor: score >= level ? color : "#2A2A28",
          }}
        />
      ))}
      <Typography
        sx={{ fontSize: 11, color: "text.secondary", ml: 0.75, minWidth: 34 }}
      >
        {score > 0 ? t(config.labels[score - 1] ?? "") : ""}
      </Typography>
    </Box>
  );
}

function Field({
  name,
  prop,
  control,
  t,
}: {
  name: string;
  prop: JsonSchemaProperty;
  control: Control<FieldValues>;
  t: (key: string, fallback?: string) => string;
}) {
  const [showPw, setShowPw] = useState(false);
  const label = t(prop.title ?? name);
  const widget = widgetFor(prop);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        if (widget === "switch" || widget === "checkbox") {
          const Toggle = widget === "switch" ? Switch : Checkbox;
          return (
            <FormControlLabel
              control={
                <Toggle
                  checked={!!field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label={label}
            />
          );
        }

        const helperText = fieldState.error?.message
          ? t(fieldState.error.message)
          : prop.help
            ? t(prop.help)
            : undefined;
        if (widget === "select") {
          return (
            <TextField
              select
              fullWidth
              label={prop.hideLabel ? undefined : label}
              value={field.value ?? ""}
              onChange={field.onChange}
              onBlur={field.onBlur}
              error={!!fieldState.error}
              helperText={helperText}
            >
              {(prop.enum ?? []).map((v, i) => (
                <MenuItem key={String(v)} value={v}>
                  {prop.enumNames?.[i] ?? String(v)}
                </MenuItem>
              ))}
            </TextField>
          );
        }

        const isPw = widget === "password";
        const strength = isPw ? resolveStrength(prop.strengthMeter) : null;
        const type = isPw
          ? showPw
            ? "text"
            : "password"
          : prop.format === "email"
            ? "email"
            : prop.type === "number" || prop.type === "integer"
              ? "number"
              : "text";

        return (
          <Box>
            <TextField
              {...field}
              value={field.value ?? ""}
              fullWidth
              type={widget === "textarea" ? undefined : type}
              multiline={widget === "textarea"}
              minRows={prop.rows}
              hiddenLabel={prop.hideLabel}
              label={prop.hideLabel ? undefined : label}
              placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
              error={!!fieldState.error}
              helperText={helperText}
              slotProps={{
                input: {
                  startAdornment: prop.icon ? (
                    <InputAdornment
                      position="start"
                      sx={{ color: "text.disabled" }}
                    >
                      <IconRenderer name={prop.icon} size={18} />
                    </InputAdornment>
                  ) : undefined,
                  endAdornment: isPw ? (
                    <IconButton
                      size="small"
                      onClick={() => setShowPw((v) => !v)}
                      sx={{ color: "text.disabled" }}
                    >
                      <IconRenderer
                        name={showPw ? "visibility-off" : "visibility"}
                        size={18}
                      />
                    </IconButton>
                  ) : undefined,
                },
              }}
            />
            {strength ? (
              <StrengthMeter
                value={String(field.value ?? "")}
                config={strength}
                t={t}
              />
            ) : null}
          </Box>
        );
      }}
    />
  );
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
}: FormRendererProps) {
  const { t } = useTranslation(id);
  const resolver = useMemo(
    () => ajvResolver(schema as never, { strict: false }),
    [schema],
  );
  const initial = useMemo(() => {
    const values: FieldValues = { ...defaultValues };
    for (const [key, prop] of Object.entries(schema.properties)) {
      if (values[key] === undefined) {
        values[key] = prop.default ?? (prop.type === "boolean" ? false : "");
      }
    }
    return values;
  }, [schema, defaultValues]);

  const { control, handleSubmit, formState } = useForm<FieldValues>({
    resolver,
    defaultValues: initial,
    mode: "onTouched",
  });

  return (
    <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <Stack spacing={1.5}>
        {Object.entries(schema.properties).map(([fieldName, prop]) => (
          <Field
            key={fieldName}
            name={fieldName}
            prop={prop}
            control={control}
            t={t}
          />
        ))}
        {beforeSubmit}
        {onCancel ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "flex-end",
              gap: "8px",
              borderTop: "1px solid rgba(255,255,255,.08)",
              pt: "16px",
            }}
          >
            <Button
              variant="outlined"
              onClick={onCancel}
              sx={{
                borderRadius: "999px",
                px: "18px",
                fontSize: 12.5,
                fontWeight: 600,
              }}
            >
              {t(cancelLabel)}
            </Button>
            <Button
              type="submit"
              variant="contained"
              loading={loading || formState.isSubmitting}
              sx={{
                borderRadius: "999px",
                px: "20px",
                fontSize: 12.5,
                fontWeight: 700,
              }}
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
              py: 1.4,
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
