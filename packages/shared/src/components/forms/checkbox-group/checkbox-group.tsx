"use client";

import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/** Multi-select from `enum`. Stores `string[]`, ordered as configured rather
 * than by click order. */
export function CheckboxGroupWidget({ prop, field, fieldState, t }: WidgetProps) {
  const options = prop.enum ?? [];
  const selected = new Set(Array.isArray(field.value) ? field.value : []);

  const toggle = (option: string | number) => {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    field.onChange(options.filter((o) => next.has(o)));
  };

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${prop.columns ?? 1}, 1fr)`,
          gap: "2px",
        }}
      >
        {options.map((option, index) => (
          <FormControlLabel
            key={String(option)}
            control={
              <Checkbox
                size="small"
                checked={selected.has(option)}
                onChange={() => toggle(option)}
              />
            }
            label={t(prop.enumNames?.[index] ?? String(option))}
            sx={{ "& .MuiFormControlLabel-label": { fontSize: 13 } }}
          />
        ))}
      </Box>
    </FieldShell>
  );
}
