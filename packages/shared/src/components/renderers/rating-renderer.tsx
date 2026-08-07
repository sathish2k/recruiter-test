"use client";

import Box from "@mui/material/Box";
import Rating from "@mui/material/Rating";
import delve from "dlv";

export interface RatingRendererConfig {
  type: "rating";
  /** Data path to the score. */
  path: string;
  /** Top of the scale. Default 5. */
  max?: number;
  /** Prints "4.2" beside the stars — use when the value is a average, not a
   * cast vote, since half-stars alone read as rounding. */
  showValue?: boolean;
  /** Fall back to this when the record has no score yet. */
  emptyText?: string;
}

export function RatingRenderer({
  config,
  data = {},
}: {
  config: RatingRendererConfig;
  data?: Record<string, unknown>;
}) {
  const raw = delve(data, config.path);
  const value = typeof raw === "number" ? raw : Number(raw);
  const max = config.max ?? 5;

  if (!Number.isFinite(value) || value <= 0) {
    return <Box sx={{ fontSize: 12.5, color: "text.disabled" }}>{config.emptyText ?? "—"}</Box>;
  }

  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "7px" }}>
      <Rating value={value} max={max} precision={0.5} readOnly size="small" sx={{ fontSize: 16 }} />
      {config.showValue ? (
        <Box
          sx={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "text.secondary",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value.toFixed(1)}
        </Box>
      ) : null}
    </Box>
  );
}
