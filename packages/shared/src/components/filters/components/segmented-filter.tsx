"use client";

import Box from "@mui/material/Box";
import type { SegmentedFilter } from "../types";

export function SegmentedFilterComponent({
  config,
  value,
  onChange,
}: {
  config: SegmentedFilter;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const active = value ?? config.options[0]?.value;
  return (
    <Box
      sx={{
        display: "flex",
        background: "#1C1C1B",
        border: "1px solid rgba(255,255,255,.08)",
        borderRadius: "999px",
        p: "4px",
      }}
    >
      {config.options.map((option) => (
        <Box
          key={option.value}
          onClick={() => onChange(option.value)}
          sx={{
            px: "14px",
            py: "7px",
            borderRadius: "999px",
            fontSize: 12.5,
            cursor: "pointer",
            ...(active === option.value
              ? { background: "rgba(255,255,255,.1)", fontWeight: 600 }
              : { color: "#9A968E" }),
          }}
        >
          {option.label}
          {option.count != null ? ` (${option.count})` : ""}
        </Box>
      ))}
    </Box>
  );
}
