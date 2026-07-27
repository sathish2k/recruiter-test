"use client";

import Typography from "@mui/material/Typography";
import type { WidgetProps } from "../types";

/** Display-only sub-heading inside a section card — the design's `BILLING` /
 * `OFFICE` labels that split one card into two labelled blocks. Holds no value. */
export function HeadingWidget({ prop, t }: WidgetProps) {
  return (
    <Typography
      sx={{
        fontSize: 11.5,
        fontWeight: 700,
        letterSpacing: ".1em",
        color: "surface.textSecondary",
      }}
    >
      {t(prop.title ?? "")}
    </Typography>
  );
}
