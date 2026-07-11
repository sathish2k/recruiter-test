"use client";

import DomainRounded from "@mui/icons-material/DomainRounded";
import LockOutlined from "@mui/icons-material/LockOutlined";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
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
import { type ReactNode, useMemo, useState } from "react";
import {
  type Control,
  Controller,
  type FieldValues,
  useForm,
} from "react-hook-form";
import type { FormRendererProps, JsonSchemaProperty, Widget } from "./types";

const STRENGTH_COLORS = ["", "#E05B5B", "#D69B3C", "#4EA874"];
const STRENGTH_LABELS = ["", "Weak", "Okay", "Strong"];

const ICONS: Record<string, ReactNode> = {
  mail: <MailOutlineRounded sx={{ fontSize: 18 }} />,
  lock: <LockOutlined sx={{ fontSize: 18 }} />,
  person: <PersonOutlineRounded sx={{ fontSize: 18 }} />,
  domain: <DomainRounded sx={{ fontSize: 18 }} />,
};

function passwordStrength(pw: string): number {
  if (!pw) return 0;
  if (pw.length < 8) return 1;
  return /[A-Z]/.test(pw) && /[0-9]/.test(pw) ? 3 : 2;
}

function widgetFor(prop: JsonSchemaProperty): Widget {
  if (prop.widget) return prop.widget;
  if (prop.enum) return "select";
  if (prop.type === "boolean") return "switch";
  if (prop.format === "password") return "password";
  return "text";
}

function StrengthMeter({ value }: { value: string }) {
  const score = passwordStrength(value);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1 }}>
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            height: 4,
            borderRadius: 999,
            bgcolor: score >= i ? STRENGTH_COLORS[score] : "#2A2A28",
          }}
        />
      ))}
      <Typography
        sx={{ fontSize: 11, color: "text.secondary", ml: 0.75, minWidth: 34 }}
      >
        {STRENGTH_LABELS[score] ?? ""}
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
                      {ICONS[prop.icon]}
                    </InputAdornment>
                  ) : undefined,
                  endAdornment: isPw ? (
                    <IconButton
                      size="small"
                      onClick={() => setShowPw((v) => !v)}
                      sx={{ color: "text.disabled" }}
                    >
                      {showPw ? (
                        <VisibilityOffRounded sx={{ fontSize: 18 }} />
                      ) : (
                        <VisibilityRounded sx={{ fontSize: 18 }} />
                      )}
                    </IconButton>
                  ) : undefined,
                },
              }}
            />
            {isPw && prop.strengthMeter ? (
              <StrengthMeter value={String(field.value ?? "")} />
            ) : null}
          </Box>
        );
      }}
    />
  );
}

export function FormRenderer({
  schema,
  defaultValues,
  onSubmit,
  submitLabel = "Submit",
  loading = false,
  t = (key) => key,
  beforeSubmit,
}: FormRendererProps) {
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
        <Button
          type="submit"
          variant="contained"
          fullWidth
          loading={loading || formState.isSubmitting}
          sx={{ borderRadius: "12px", py: 1.4, fontSize: 14, fontWeight: 700 }}
        >
          {submitLabel}
        </Button>
      </Stack>
    </Box>
  );
}
