"use client";

import Box from "@mui/material/Box";
import type { RadioFilter } from "../types";
import { FilterPopover, optionRowSx } from "./filter-popover";

export function RadioFilterComponent({
  config,
  value,
  onChange,
  active: activeProp,
}: {
  config: RadioFilter;
  value: string | undefined;
  onChange: (value: string) => void;
  active?: boolean;
}) {
  const selected = config.options.find((o) => o.value === value);
  return (
    <FilterPopover
      label={config.label?.name}
      summary={selected?.label}
      active={activeProp}
    >
      {(close) =>
        config.options.map((option) => {
          const active = option.value === value;
          return (
            <Box
              key={option.value}
              onClick={() => {
                onChange(option.value);
                close();
              }}
              sx={optionRowSx(active)}
            >
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: "999px",
                  border: "1px solid rgba(255,255,255,.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                }}
              >
                {active ? (
                  <Box
                    sx={{
                      width: 7,
                      height: 7,
                      borderRadius: "999px",
                      background: "#F26A1B",
                    }}
                  />
                ) : null}
              </Box>
              {option.label}
            </Box>
          );
        })
      }
    </FilterPopover>
  );
}
