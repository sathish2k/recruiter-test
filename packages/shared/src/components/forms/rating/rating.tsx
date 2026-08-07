"use client";

import Box from "@mui/material/Box";
import MuiRating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import type { WidgetProps } from "../types";

/**
 * A scored judgement — an interview scorecard line, a client's rating of a
 * submission. Reads out the value in words beside the stars, because a star
 * count alone is not announced and is not legible at a glance in a dense list.
 */
export function RatingWidget({ name, prop, field, t, disabled }: WidgetProps) {
  const max = typeof prop.maximum === "number" ? prop.maximum : 5;
  const value = typeof field.value === "number" ? field.value : 0;
  // `x.labels.3` names each step; without them the readout is just "3 of 5".
  const labelKey = value ? `${name}.labels.${value}` : "";
  const readout = labelKey ? t(labelKey, { defaultValue: "" }) : "";

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "10px", minHeight: 30 }}>
      <MuiRating
        name={name}
        max={max}
        value={value}
        readOnly={prop.readOnly}
        disabled={disabled}
        onChange={(_, next) => field.onChange(next ?? 0)}
        onBlur={field.onBlur}
      />
      <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "text.secondary" }}>
        {readout ||
          (value ? `${value} / ${max}` : t(`${name}.empty`, { defaultValue: "Not rated" }))}
      </Typography>
    </Box>
  );
}
