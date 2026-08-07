"use client";

import Box from "@mui/material/Box";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/**
 * Single choice drawn as an even row of bordered tiles — the design's
 * replacement-period picker. Use over `radio` when the options are few, short
 * and worth showing as equally-weighted targets; over `segmented` when they
 * read as discrete values rather than modes.
 */
export function TilesWidget({ prop, field, fieldState, t }: WidgetProps) {
  const options = prop.enum ?? [];
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
          gridTemplateColumns: `repeat(${options.length}, 1fr)`,
          gap: "8px",
        }}
      >
        {options.map((option, index) => {
          const raw = String(option);
          const selected = String(field.value ?? "") === raw;
          const label = prop.enumNames?.[index]
            ? t(prop.enumNames[index])
            : prop.enumL10n
              ? t(`${prop.enumL10n}.${raw || "none"}`)
              : t(raw);
          return (
            <Box
              key={raw}
              onClick={() => field.onChange(option)}
              sx={{
                textAlign: "center",
                p: "9px 0",
                borderRadius: "10px",
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
                border: "1px solid",
                bgcolor: selected ? "surface.primarySoftBg" : "surface.inset",
                borderColor: selected ? "surface.primarySoftBorder" : "surface.controlBorder",
                color: selected ? "surface.accentBright" : "surface.textSecondary",
                "&:hover": { borderColor: selected ? undefined : "surface.borderStrong" },
              }}
            >
              {label}
            </Box>
          );
        })}
      </Box>
    </FieldShell>
  );
}
