"use client";

import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";
import { PasswordStrengthMeter, resolveStrengthConfig } from "./password-strength";

export function PasswordWidget({ prop, field, fieldState, t }: WidgetProps) {
  const [reveal, setReveal] = useState(false);
  const strength = resolveStrengthConfig(prop.strengthMeter);

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
        <PasswordStrengthMeter value={String(field.value ?? "")} config={strength} t={t} />
      ) : null}
    </FieldShell>
  );
}
