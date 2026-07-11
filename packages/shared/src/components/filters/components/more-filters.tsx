"use client";

import MoreHorizRounded from "@mui/icons-material/MoreHorizRounded";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { type ReactNode, useState } from "react";
import type { FilterConfig } from "../types";

// The overflow control: a "More filters" button that opens a popover stacking
// the filters that didn't fit inline (each with its label + control).
export function MoreFilters({
  filters,
  label,
  renderControl,
}: {
  filters: FilterConfig[];
  label: string;
  renderControl: (filter: FilterConfig) => ReactNode;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          px: "16px",
          py: "9px",
          borderRadius: "999px",
          border: "1px solid rgba(255,255,255,.14)",
          fontSize: 13,
          color: "#9A968E",
          cursor: "pointer",
          "&:hover": { background: "rgba(255,255,255,.06)", color: "#ECEAE7" },
        }}
      >
        <MoreHorizRounded sx={{ fontSize: 18 }} />
        {label}
      </Box>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              mt: "6px",
              minWidth: 260,
              background: "#1F1F1E",
              border: "1px solid rgba(255,255,255,.12)",
              borderRadius: "14px",
              p: "16px",
            },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filters.map((filter) => (
            <Box key={filter.key}>
              {filter.label ? (
                <Typography sx={{ fontSize: 12, color: "#9A968E", mb: "6px" }}>
                  {filter.label.name}
                </Typography>
              ) : null}
              {renderControl(filter)}
            </Box>
          ))}
        </Box>
      </Popover>
    </>
  );
}
