"use client";

import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/** Single-line and multi-line text, plus the email/number input types. */
export function TextWidget({ prop, field, fieldState, t, disabled }: WidgetProps) {
  const multiline = prop.widget === "textarea";
  const type =
    prop.format === "email"
      ? "email"
      : prop.type === "number" || prop.type === "integer"
        ? "number"
        : "text";

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
        type={multiline ? undefined : type}
        multiline={multiline}
        minRows={prop.rows}
        disabled={prop.readOnly || disabled}
        placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
        error={!!fieldState.error}
        slotProps={{
          input: {
            startAdornment: prop.icon ? (
              <InputAdornment position="start" sx={{ color: "text.secondary" }}>
                <IconRenderer name={prop.icon} size={20} />
              </InputAdornment>
            ) : undefined,
          },
        }}
      />
    </FieldShell>
  );
}
