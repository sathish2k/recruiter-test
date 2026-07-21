"use client";

import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/** Single choice from `enum`. Use over `select` when the options are few and
 * worth showing at once; `row` lays them out horizontally. */
export function RadioWidget({ prop, field, fieldState, t }: WidgetProps) {
  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <RadioGroup
        row={prop.row}
        value={field.value ?? ""}
        onChange={(event) => field.onChange(event.target.value)}
      >
        {(prop.enum ?? []).map((option, index) => (
          <FormControlLabel
            key={String(option)}
            value={option}
            control={<Radio size="small" />}
            label={t(prop.enumNames?.[index] ?? String(option))}
            sx={{ "& .MuiFormControlLabel-label": { fontSize: 13 } }}
          />
        ))}
      </RadioGroup>
    </FieldShell>
  );
}
