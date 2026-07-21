"use client";

import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import type { SelectOption } from "../types";

export interface SelectFieldProps {
  value: string;
  onChange: (event: { target: { value: unknown } }) => void;
  onBlur?: () => void;
  options: SelectOption[];
  error?: boolean;
  disabled?: boolean;
}

/**
 * A plain dropdown menu. Reads better than a type-ahead for a handful of
 * choices — no input affordance implying you should type.
 */
export function SelectField({
  value,
  onChange,
  onBlur,
  options,
  error,
  disabled,
}: SelectFieldProps) {
  return (
    <TextField
      select
      fullWidth
      hiddenLabel
      value={value ?? ""}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      disabled={disabled}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
