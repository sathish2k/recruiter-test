"use client";

import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import { type ReactNode, useState } from "react";

// A filter trigger button + popover. `children` receives a `close` callback so
// single-select controls can dismiss on choose. Shared by the popover-based
// filter controls (dropdown, radio, checkbox, date, daterange, range).
export function FilterPopover({
  label,
  summary,
  minWidth = 200,
  children,
}: {
  label?: string;
  summary?: string;
  minWidth?: number;
  children: (close: () => void) => ReactNode;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          px: "16px",
          py: "9px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,.1)",
          background: "#1C1C1B",
          fontSize: 13,
          color: summary ? "#ECEAE7" : "#9A968E",
          cursor: "pointer",
        }}
      >
        {summary ?? label ?? ""}
        <ExpandMoreRounded sx={{ fontSize: 18, color: "#7C7972" }} />
      </Box>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: "6px",
              minWidth,
              background: "#1F1F1E",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "12px",
              p: "6px",
            },
          },
        }}
      >
        {children(() => setAnchor(null))}
      </Popover>
    </>
  );
}

export const optionRowSx = (active: boolean) => ({
  display: "flex",
  alignItems: "center",
  gap: "10px",
  px: "12px",
  py: "9px",
  borderRadius: "8px",
  fontSize: 13,
  cursor: "pointer",
  color: active ? "#ECEAE7" : "#9A968E",
  "&:hover": { background: "rgba(255,255,255,.05)" },
});

export const DARK_INPUT_STYLE: React.CSSProperties = {
  background: "#141413",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: "8px",
  padding: "8px 10px",
  fontSize: "13px",
  color: "#ECEAE7",
  fontFamily: "inherit",
  outline: "none",
  colorScheme: "dark",
};
