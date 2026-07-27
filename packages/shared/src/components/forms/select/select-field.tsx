"use client";

import Box from "@mui/material/Box";
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

/** The design marks a lifecycle value with a small colour dot before its label. */
export function Dot({ color }: { color: string }) {
  return (
    <Box
      component="span"
      sx={{
        width: 7,
        height: 7,
        borderRadius: "999px",
        background: color,
        flex: "none",
        mr: "8px",
        display: "inline-block",
      }}
    />
  );
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
      // Render the selected item even when the value is "" — otherwise MUI treats
      // an empty value as "no selection" and hides an explicit "None" option.
      slotProps={{ select: { displayEmpty: true } }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.dot ? <Dot color={option.dot} /> : null}
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
