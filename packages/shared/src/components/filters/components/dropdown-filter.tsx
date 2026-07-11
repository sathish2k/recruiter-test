"use client";

import Box from "@mui/material/Box";
import type { DropdownFilter } from "../types";
import { FilterPopover, optionRowSx } from "./filter-popover";

export function DropdownFilterComponent({
  config,
  value,
  onChange,
}: {
  config: DropdownFilter;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const selected = config.options.find((o) => o.value === value);
  return (
    <FilterPopover label={config.label?.name} summary={selected?.label}>
      {(close) =>
        config.options.map((option) => (
          <Box
            key={option.value}
            onClick={() => {
              onChange(option.value);
              close();
            }}
            sx={optionRowSx(option.value === value)}
          >
            {option.label}
          </Box>
        ))
      }
    </FilterPopover>
  );
}
