"use client";

import Box from "@mui/material/Box";
import type { RangeFilter } from "../types";
import { DARK_INPUT_STYLE, FilterPopover } from "./filter-popover";

export interface RangeValue {
  min?: number;
  max?: number;
}

export function RangeFilterComponent({
  config,
  value,
  onChange,
}: {
  config: RangeFilter;
  value: RangeValue | undefined;
  onChange: (value: RangeValue) => void;
}) {
  const range = value ?? {};
  const summary =
    range.min != null || range.max != null
      ? `${range.min ?? config.min} – ${range.max ?? config.max}`
      : undefined;

  const toNum = (raw: string) => (raw === "" ? undefined : Number(raw));

  return (
    <FilterPopover label={config.label?.name} summary={summary} minWidth={220}>
      {() => (
        <Box sx={{ display: "flex", gap: "8px", p: "4px" }}>
          <input
            type="number"
            min={config.min}
            max={config.max}
            value={range.min ?? ""}
            onChange={(e) => onChange({ ...range, min: toNum(e.target.value) })}
            style={{ ...DARK_INPUT_STYLE, width: 90 }}
          />
          <input
            type="number"
            min={config.min}
            max={config.max}
            value={range.max ?? ""}
            onChange={(e) => onChange({ ...range, max: toNum(e.target.value) })}
            style={{ ...DARK_INPUT_STYLE, width: 90 }}
          />
        </Box>
      )}
    </FilterPopover>
  );
}
