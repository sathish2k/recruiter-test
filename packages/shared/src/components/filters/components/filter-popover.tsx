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
          // A floor and a ceiling: short labels still read as a control, and a
          // long selection summary truncates instead of pushing the row wide.
          minWidth: 132,
          maxWidth: 220,
          justifyContent: "space-between",
          flex: "none",
          "& .MuiButton-endIcon": { flex: "none", ml: "6px" },
          // Only the label shrinks — `&` here would undo minWidth above.
          "& > span:first-of-type": { minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" },
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
          background: active
            ? "var(--mui-palette-surface-primarySoftBg)"
            : "var(--mui-palette-background-paper)",
          borderColor: active ? "var(--mui-palette-surface-focusRing)" : undefined,
          color: active
            ? "var(--mui-palette-surface-primarySoftFg)"
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
  "&:hover": { background: "var(--mui-palette-surface-hoverSubtle)" },
});

export const DARK_INPUT_STYLE: React.CSSProperties = {
  background: "var(--mui-palette-surface-inset)",
  border: "1px solid var(--mui-palette-surface-border)",
  borderRadius: "8px",
  padding: "8px 10px",
  fontSize: "13px",
  color: "text.primary",
  fontFamily: "inherit",
  outline: "none",
  colorScheme: "dark",
};
