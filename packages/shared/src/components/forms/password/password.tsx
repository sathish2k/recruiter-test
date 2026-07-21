"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import type { JsonSchemaProperty, PasswordStrengthConfig, Translate, WidgetProps } from "../types";

/** Shown when a translation is missing, so the meter is never blank. */
const STRENGTH_FALLBACKS = ["Weak", "Okay", "Strong"];

const DEFAULT_STRENGTH: Required<PasswordStrengthConfig> = {
  rules: ["^.{8,}$", "[A-Z]", "[0-9]"],
  labels: ["form.strength.weak", "form.strength.okay", "form.strength.strong"],
  colors: ["error.main", "warning.main", "success.main"],
};

function resolveStrength(
  strengthMeter: JsonSchemaProperty["strengthMeter"],
): Required<PasswordStrengthConfig> | null {
  if (!strengthMeter) return null;
  return strengthMeter === true ? DEFAULT_STRENGTH : { ...DEFAULT_STRENGTH, ...strengthMeter };
}

function StrengthMeter({
  value,
  config,
  t,
}: {
  value: string;
  config: Required<PasswordStrengthConfig>;
  t: Translate;
}) {
  const score = value
    ? config.rules.reduce((n, r) => (new RegExp(r).test(value) ? n + 1 : n), 0)
    : 0;
  const color = config.colors[score - 1] ?? config.colors[config.colors.length - 1];
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
            bgcolor: score >= level ? color : "surface.neutral",
          }}
        />
      ))}
      <Typography sx={{ fontSize: 11, color: "text.secondary", ml: 0.75, minWidth: 34 }}>
        {score > 0 ? t(config.labels[score - 1] ?? "", STRENGTH_FALLBACKS[score - 1]) : ""}
      </Typography>
    </Box>
  );
}

/** Password input with a reveal toggle and an optional strength meter. */
export function PasswordWidget({ prop, field, fieldState, t }: WidgetProps) {
  const [reveal, setReveal] = useState(false);
  const strength = resolveStrength(prop.strengthMeter);

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <TextField
        {...field}
        value={field.value ?? ""}
        fullWidth
        hiddenLabel
        type={reveal ? "text" : "password"}
        placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
        error={!!fieldState.error}
        slotProps={{
          input: {
            startAdornment: prop.icon ? (
              <InputAdornment position="start" sx={{ color: "text.disabled" }}>
                <IconRenderer name={prop.icon} size={18} />
              </InputAdornment>
            ) : undefined,
            endAdornment: (
              <IconButton
                size="small"
                edge="end"
                onClick={() => setReveal((value) => !value)}
                aria-label={t("form.togglePassword", "Show or hide password")}
                sx={{ color: "text.disabled" }}
              >
                <IconRenderer name={reveal ? "visibility-off" : "visibility"} size={18} />
              </IconButton>
            ),
          },
        }}
      />
      {strength ? (
        <StrengthMeter value={String(field.value ?? "")} config={strength} t={t} />
      ) : null}
    </FieldShell>
  );
}
