"use client";

import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import { useState } from "react";
import { useFormatters } from "../../../utils/format";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/**
 * Money. Stores a plain `number` — the grouping is presentation only, so the
 * schema still validates a number and the API still receives one.
 *
 * Grouped while the field is at rest, raw while it has focus. Typing into a
 * field that reformats under the caret is the fastest way to lose a keystroke,
 * and a fee figure is exactly where that costs the most.
 */
export function CurrencyWidget({ prop, field, fieldState, t, disabled }: WidgetProps) {
  const { formatNumber } = useFormatters();
  const [editing, setEditing] = useState(false);

  const raw = field.value;
  const numeric = typeof raw === "number" ? raw : raw === "" || raw == null ? null : Number(raw);
  const display =
    editing || numeric === null || Number.isNaN(numeric)
      ? (raw ?? "")
      : formatNumber(numeric, { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <TextField
        {...field}
        value={display}
        onFocus={() => setEditing(true)}
        onBlur={(event) => {
          setEditing(false);
          field.onBlur();
          const next = event.target.value.replace(/[^0-9.-]/g, "");
          field.onChange(next === "" ? "" : Number(next));
        }}
        onChange={(event) => {
          // Strip grouping as it is typed, so a pasted "1,250.00" still lands
          // as a number rather than NaN.
          const next = event.target.value.replace(/[^0-9.-]/g, "");
          field.onChange(next === "" ? "" : Number(next));
        }}
        fullWidth
        hiddenLabel
        disabled={disabled}
        placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
        error={!!fieldState.error}
        slotProps={{
          htmlInput: { inputMode: "decimal", min: prop.minimum, max: prop.maximum },
          input: {
            startAdornment: (
              <InputAdornment position="start" sx={{ color: "text.disabled" }}>
                {t(prop.unit ?? "currency.symbol", { defaultValue: "$" })}
              </InputAdornment>
            ),
          },
        }}
      />
    </FieldShell>
  );
}
