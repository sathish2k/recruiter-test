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
          gap: "9px",
          width,
          bgcolor: "surface.inset",
          border: "1px solid var(--mui-palette-surface-controlBorder)",
          borderRadius: "999px",
          px: "16px",
          color: "text.disabled",
          "&:focus-within": { borderColor: "var(--mui-palette-surface-focusRing)" },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <SearchRounded sx={{ fontSize: 17 }} />
      <InputBase
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        sx={{
          flex: 1,
          minWidth: 0,
          fontSize: 13,
          color: "text.primary",
          // The padding belongs to the inner input, not the InputBase root —
          // stacking both (plus MUI's line-height) made this 50px tall where
          // every other control is 40.5.
          lineHeight: "normal",
          "& .MuiInputBase-input": { p: "11px 0", height: "auto", lineHeight: "normal" },
        }}
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
