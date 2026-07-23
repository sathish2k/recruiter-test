"use client";

import TextField from "@mui/material/TextField";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/** Date / time / datetime input. Uses the native picker rather than a date
 * library — the value is an ISO string, which is what the API stores. */
export function DateWidget({ prop, field, fieldState, t, disabled }: WidgetProps) {
  const type =
    prop.widget === "time" ? "time" : prop.widget === "datetime" ? "datetime-local" : "date";

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
        type={type}
        disabled={disabled}
        error={!!fieldState.error}
        slotProps={{ htmlInput: { min: prop.min, max: prop.max } }}
      />
    </FieldShell>
  );
}
