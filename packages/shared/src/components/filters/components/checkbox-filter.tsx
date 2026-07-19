"use client";

import CheckRounded from "@mui/icons-material/CheckRounded";
import Box from "@mui/material/Box";
import type { CheckboxFilter, SelectFilter } from "../types";
import { FilterPopover, optionRowSx } from "./filter-popover";

export function CheckboxFilterComponent({
  config,
  value,
  onChange,
  active,
}: {
  config: CheckboxFilter | SelectFilter;
  value: string[] | undefined;
  onChange: (value: string[]) => void;
  active?: boolean;
}) {
  const values = Array.isArray(value) ? value : [];
  const first = values.length
    ? (config.options.find((o) => o.value === values[0])?.label ?? values[0])
    : undefined;
  const summary = first
    ? `${[config.label?.name, first].filter(Boolean).join(": ")}${
        values.length > 1 ? ` +${values.length - 1}` : ""
      }`
    : undefined;

  const toggle = (v: string) =>
    onChange(
      values.includes(v) ? values.filter((x) => x !== v) : [...values, v],
    );

  return (
    <FilterPopover label={config.label?.name} summary={summary} active={active}>
      {() =>
        config.options.map((option) => {
          const checked = values.includes(option.value);
          return (
            <Box
              key={option.value}
              onClick={() => toggle(option.value)}
              sx={optionRowSx(checked)}
            >
              <Box
                sx={{
                  width: 16,
                  height: 16,
                  borderRadius: "5px",
                  border: "1px solid rgba(255,255,255,.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flex: "none",
                  background: checked ? "#F26A1B" : "transparent",
                  borderColor: checked ? "#F26A1B" : "rgba(255,255,255,.3)",
                }}
              >
                {checked ? (
                  <CheckRounded sx={{ fontSize: 13, color: "#fff" }} />
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
