"use client";

import Box from "@mui/material/Box";
import type { DateRangeFilter } from "../types";
import { DARK_INPUT_STYLE, FilterPopover } from "./filter-popover";

export interface DateRangeValue {
  from?: string;
  to?: string;
}

export function DateRangeFilterComponent({
  config,
  value,
  onChange,
  active,
}: {
  config: DateRangeFilter;
  value: DateRangeValue | undefined;
  onChange: (value: DateRangeValue) => void;
  active?: boolean;
}) {
  const range = value ?? {};
  const summary = range.from || range.to ? `${range.from ?? "…"} – ${range.to ?? "…"}` : undefined;

  return (
    <FilterPopover
      icon={config.icon}
      label={config.label?.name}
      summary={summary}
      minWidth={220}
      active={active}
    >
      {() => (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            p: "4px",
          }}
        >
          <input
            type="date"
            value={range.from ?? ""}
            onChange={(e) => onChange({ ...range, from: e.target.value })}
            style={{ ...DARK_INPUT_STYLE, width: "100%" }}
          />
          <input
            type="date"
            value={range.to ?? ""}
            onChange={(e) => onChange({ ...range, to: e.target.value })}
            style={{ ...DARK_INPUT_STYLE, width: "100%" }}
          />
        </Box>
      )}
    </FilterPopover>
  );
}
