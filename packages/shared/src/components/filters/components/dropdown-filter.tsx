"use client";

import Box from "@mui/material/Box";
import type { DropdownFilter } from "../types";
import { useFilterOptions } from "../use-filter-options";
import { FilterPopover, optionRowSx } from "./filter-popover";

export function DropdownFilterComponent({
  config,
  value,
  onChange,
  active,
}: {
  config: DropdownFilter;
  value: string | undefined;
  onChange: (value: string) => void;
  active?: boolean;
}) {
  const options = useFilterOptions(config);
  const selected = options.find((o) => o.value === value);
  return (
    <FilterPopover
      icon={config.icon}
      label={config.label?.name}
      summary={selected?.label}
      active={active}
    >
      {(close) =>
        options.map((option) => (
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
