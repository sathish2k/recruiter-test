"use client";

import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/** Numeric input. Stores a `number` (or "" when cleared), so a schema declaring
 * `type: "number"` validates without the string coercion a text field needs. */
export function NumberWidget({ prop, field, fieldState, t, disabled }: WidgetProps) {
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
        onChange={(event) => {
          const raw = event.target.value;
          field.onChange(raw === "" ? "" : Number(raw));
        }}
        fullWidth
        hiddenLabel
        type="number"
        disabled={disabled}
        placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
        error={!!fieldState.error}
        slotProps={{
          htmlInput: { min: prop.minimum, max: prop.maximum, step: prop.step },
          input: {
            startAdornment: prop.icon ? (
              <InputAdornment position="start" sx={{ color: "text.disabled" }}>
                <IconRenderer name={prop.icon} size={18} />
              </InputAdornment>
            ) : prop.unit && prop.unitPosition !== "end" ? (
              <InputAdornment position="start" sx={{ color: "text.disabled" }}>
                {t(prop.unit)}
              </InputAdornment>
            ) : undefined,
            endAdornment:
              prop.unit && prop.unitPosition === "end" ? (
                <InputAdornment position="end" sx={{ color: "text.disabled" }}>
                  {t(prop.unit)}
                </InputAdornment>
              ) : undefined,
          },
        }}
      />
    </FieldShell>
  );
}
