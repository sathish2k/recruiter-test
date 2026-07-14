"use client";

import Box from "@mui/material/Box";
import type { DateFilter } from "../types";
import { DARK_INPUT_STYLE, FilterPopover } from "./filter-popover";

export function DateFilterComponent({
  config,
  value,
  onChange,
  active,
}: {
  config: DateFilter;
  value: string | undefined;
  onChange: (value: string) => void;
  active?: boolean;
}) {
  return (
    <FilterPopover
      label={config.label?.name}
      summary={value}
      minWidth={180}
      active={active}
    >
      {() => (
        <Box sx={{ p: "4px" }}>
          <input
            type="date"
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...DARK_INPUT_STYLE, width: "100%" }}
          />
        </Box>
      )}
    </FilterPopover>
  );
}
