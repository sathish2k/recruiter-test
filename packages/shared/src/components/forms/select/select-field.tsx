"use client";

import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { IconRenderer } from "../../renderers";
import type { SelectOption } from "../types";

export interface SelectFieldProps {
  value: string;
  onChange: (event: { target: { value: unknown } }) => void;
  onBlur?: () => void;
  options: SelectOption[];
  error?: boolean;
  disabled?: boolean;
  /** `"pill"` — a rounded section-header chip. `"compact"` — a short control
   * that sits beside another field, sized to its content. */
  look?: "pill" | "compact" | "label";
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

/** The two off-grid looks. Both size to their content rather than the cell. */
const LOOKS = {
  pill: {
    "& .MuiInputBase-root": {
      borderRadius: "999px",
      bgcolor: "transparent",
      fontSize: 12,
      fontWeight: 600,
      color: "surface.textMuted",
    },
    "& .MuiSelect-select": { padding: "7px 30px 7px 12px" },
  },
  label: {
    "& .MuiInputBase-root": {
      fontSize: 12.5,
      fontWeight: 700,
      color: "surface.primarySoftFg",
      bgcolor: "transparent",
      "& fieldset": { border: "none" },
    },
    "& .MuiSelect-select": { padding: "0 20px 0 0" },
    "& .MuiSelect-icon": { color: "surface.primarySoftFg", right: 0 },
  },
  compact: {
    "& .MuiInputBase-root": { fontSize: 13.5, fontWeight: 600, color: "surface.textMuted" },
    "& .MuiSelect-select": { padding: "12px 34px 12px 12px" },
  },
} as const;

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
  look,
}: SelectFieldProps) {
  return (
    <TextField
      select
      fullWidth={!look}
      hiddenLabel
      value={value ?? ""}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      disabled={disabled}
      // Render the selected item even when the value is "" — otherwise MUI treats
      // an empty value as "no selection" and hides an explicit "None" option.
      slotProps={{
        select: {
          displayEmpty: true,
          // A locked option's "add details first" note belongs in the menu, not
          // in the closed control — the design shows the bare label there.
          renderValue: (selected) => {
            const option = options.find((item) => item.value === selected);
            return (
              <>
                {option?.dot ? <Dot color={option.dot} /> : null}
                {option?.label ?? ""}
              </>
            );
          },
        },
      }}
      sx={look ? LOOKS[look] : undefined}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value} disabled={option.disabled}>
          {option.dot ? <Dot color={option.dot} /> : null}
          <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
            {option.label}
            {option.hint ? (
              <Box component="span" sx={{ ml: "6px", color: "text.disabled" }}>
                {option.hint}
              </Box>
            ) : null}
          </Box>
          {option.value === (value ?? "") ? (
            <Box
              component="span"
              sx={{ display: "flex", flex: "none", ml: "8px", color: "surface.accentBright" }}
            >
              <IconRenderer name="check" size={15} />
            </Box>
          ) : null}
        </MenuItem>
      ))}
    </TextField>
  );
}
