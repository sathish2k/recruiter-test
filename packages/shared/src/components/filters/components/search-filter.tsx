"use client";

import SearchRounded from "@mui/icons-material/SearchRounded";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import type { SxProps, Theme } from "@mui/material/styles";
import type { SearchFilter } from "../types";

export function SearchField({
  value,
  onChange,
  placeholder,
  width = 300,
  sx,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  width?: number;
  sx?: SxProps<Theme>;
}) {
  return (
    <Box
      sx={[
        {
          display: "flex",
          alignItems: "center",
          gap: "10px",
          width,
          bgcolor: "background.paper",
          border: "1px solid rgba(255,255,255,.1)",
          borderRadius: "999px",
          px: "16px",
          color: "text.disabled",
          "&:focus-within": { borderColor: "rgba(242,106,27,.5)" },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <SearchRounded sx={{ fontSize: 18 }} />
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{ flex: 1, fontSize: 13, color: "text.primary", py: "9px" }}
      />
    </Box>
  );
}

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
    <SearchField
      value={value}
      onChange={onChange}
      placeholder={config.placeholder}
      width={config.width}
    />
  );
}
