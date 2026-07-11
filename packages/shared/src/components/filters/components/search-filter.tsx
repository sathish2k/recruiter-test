"use client";

import SearchRounded from "@mui/icons-material/SearchRounded";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import type { SearchFilter } from "../types";

export function SearchFilterComponent({
  config,
  value,
  onChange,
}: {
  config: SearchFilter;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        width: 300,
        background: "#1C1C1B",
        border: "1px solid rgba(255,255,255,.1)",
        borderRadius: "999px",
        px: "16px",
        color: "#7C7972",
      }}
    >
      <SearchRounded sx={{ fontSize: 18 }} />
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={config.placeholder}
        sx={{ flex: 1, fontSize: 13, color: "#ECEAE7", py: "9px" }}
      />
    </Box>
  );
}
