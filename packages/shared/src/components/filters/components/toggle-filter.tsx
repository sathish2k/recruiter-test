"use client";

import Box from "@mui/material/Box";
import Switch from "@mui/material/Switch";
import type { ToggleFilter } from "../types";

export function ToggleFilterComponent({
  config,
  value,
  onChange,
}: {
  config: ToggleFilter;
  value: boolean | undefined;
  onChange: (value: boolean) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "6px",
        px: "12px",
        py: "5px",
        borderRadius: "999px",
        border: "1px solid rgba(255,255,255,.1)",
        bgcolor: "background.paper",
        fontSize: 13,
        color: value ? "text.primary" : "text.secondary",
      }}
    >
      {config.label?.name}
      <Switch size="small" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
    </Box>
  );
}
