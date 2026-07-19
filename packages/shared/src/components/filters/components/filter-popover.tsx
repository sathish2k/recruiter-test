"use client";

import ExpandMoreRounded from "@mui/icons-material/ExpandMoreRounded";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import { type ReactNode, useState } from "react";

export function FilterPopover({
  label,
  summary,
  minWidth = 220,
  active = false,
  children,
}: {
  label?: string;
  summary?: string;
  minWidth?: number;
  active?: boolean;
  children: (close: () => void) => ReactNode;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button
        variant="outlined"
        onClick={(e) => setAnchor(e.currentTarget)}
        endIcon={<ExpandMoreRounded sx={{ color: "text.disabled" }} />}
        sx={{
          fontSize: 12.5,
          fontWeight: 600,
          background: active ? "rgba(242,106,27,.12)" : "#1C1C1B",
          borderColor: active ? "rgba(242,106,27,.5)" : undefined,
          color: active
            ? "#F0B27C"
            : summary
              ? "text.primary"
              : "text.secondary",
        }}
      >
        {summary ?? label ?? ""}
      </Button>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{
          paper: { variant: "dropdown", sx: { mt: "6px", minWidth } },
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
  color: active ? "text.primary" : "text.secondary",
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
