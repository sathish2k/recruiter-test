"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

export interface DayOption {
  value: string;
  label: string;
}

export interface DayPreset {
  label: string;
  values: string[];
}

/** The design's Mon–Sun toggles. */
export const DEFAULT_DAYS: DayOption[] = [
  { value: "Mon", label: "Mon" },
  { value: "Tue", label: "Tue" },
  { value: "Wed", label: "Wed" },
  { value: "Thu", label: "Thu" },
  { value: "Fri", label: "Fri" },
  { value: "Sat", label: "Sat" },
  { value: "Sun", label: "Sun" },
];

export const DEFAULT_DAY_PRESETS: DayPreset[] = [
  { label: "Weekdays", values: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
  { label: "Weekends", values: ["Sat", "Sun"] },
  { label: "Every day", values: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] },
];

export interface DaysFieldProps {
  value: string[];
  onChange: (value: string[]) => void;
  options?: DayOption[];
  presets?: DayPreset[];
}

/** Multi-select day toggles with quick-pick shortcuts. Stores `string[]`. */
export function DaysField({
  value,
  onChange,
  options = DEFAULT_DAYS,
  presets = DEFAULT_DAY_PRESETS,
}: DaysFieldProps) {
  const selected = new Set(Array.isArray(value) ? value : []);

  const toggle = (day: string) => {
    const next = new Set(selected);
    if (next.has(day)) next.delete(day);
    else next.add(day);
    // Keep the configured order rather than click order.
    onChange(options.filter((o) => next.has(o.value)).map((o) => o.value));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: (theme) => theme.form.inlineGap }}>
        {options.map((option) => {
          const on = selected.has(option.value);
          return (
            <Box
              key={option.value}
              onClick={() => toggle(option.value)}
              role="checkbox"
              aria-checked={on}
              sx={{
                width: 44,
                textAlign: "center",
                py: "9px",
                borderRadius: "9px",
                border: "1px solid",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                userSelect: "none",
                borderColor: on ? "surface.primarySoftBorder" : "divider",
                bgcolor: on ? "surface.primarySoftBg" : "transparent",
                color: on ? "surface.primarySoftFg" : "text.disabled",
                "&:hover": { color: on ? "primary.light" : "text.secondary" },
              }}
            >
              {option.label}
            </Box>
          );
        })}
      </Box>

      {presets.length ? (
        <Box sx={{ display: "flex", gap: "8px", alignItems: "center", fontSize: 11 }}>
          {presets.map((preset, index) => (
            <Box key={preset.label} sx={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {index > 0 ? (
                <Typography component="span" sx={{ fontSize: 11, color: "text.disabled" }}>
                  ·
                </Typography>
              ) : null}
              <Typography
                component="span"
                onClick={() => onChange(preset.values)}
                sx={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: "surface.primarySoftFg",
                  cursor: "pointer",
                  "&:hover": { color: "primary.light" },
                }}
              >
                {preset.label}
              </Typography>
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}

/** The `days` widget. */
export function DaysWidget({ prop, field, fieldState, t }: WidgetProps) {
  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <DaysField
        value={Array.isArray(field.value) ? field.value : []}
        onChange={field.onChange}
        options={prop.dayOptions?.map((option) => ({ ...option, label: t(option.label) }))}
        presets={prop.dayPresets?.map((preset) => ({ ...preset, label: t(preset.label) }))}
      />
    </FieldShell>
  );
}
