"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { type ReactNode, useState } from "react";
import { IconRenderer } from "../../renderers";
import type { FilterConfig } from "../types";

export function MoreFilters({
  filters,
  label,
  activeCount = 0,
  renderControl,
}: {
  filters: FilterConfig[];
  label: string;
  activeCount?: number;
  renderControl: (filter: FilterConfig) => ReactNode;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  return (
    <>
      <Button
        variant="outlined"
        onClick={(e) => setAnchor(e.currentTarget)}
        startIcon={<IconRenderer name="filter" size={16} />}
        sx={{ fontWeight: 400, color: "text.secondary" }}
      >
        {label}
        {activeCount > 0 ? (
          <Box
            component="span"
            sx={{
              ml: "8px",
              minWidth: 18,
              height: 18,
              borderRadius: "999px",
              background: "var(--mui-palette-primary-main)",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              px: "5px",
            }}
          >
            {activeCount}
          </Box>
        ) : null}
      </Button>
      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => setAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            variant: "dropdown",
            sx: { mt: "6px", minWidth: 260, p: "16px" },
          },
        }}
      >
        <Box sx={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          {filters.map((filter) => (
            <Box key={filter.key}>
              {filter.label ? (
                <Typography sx={{ fontSize: 12, color: "text.secondary", mb: "6px" }}>
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
