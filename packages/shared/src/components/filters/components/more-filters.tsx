"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Popover from "@mui/material/Popover";
import Typography from "@mui/material/Typography";
import { type MouseEvent, type ReactNode, useState } from "react";
import { IconRenderer } from "../../renderers";
import type { FilterConfig } from "../types";

export function MoreFilters({
  filters,
  label,
  activeCount = 0,
  renderControl,
  values,
  onApply,
  onReset,
  applyLabel = "Apply",
  resetLabel = "Reset",
}: {
  filters: FilterConfig[];
  label: string;
  activeCount?: number;
  /** Bound to the popover's own draft, not the live filter state. */
  renderControl: (
    filter: FilterConfig,
    draft: Record<string, unknown>,
    set: (key: string, value: unknown) => void,
  ) => ReactNode;
  /** Current live values, used to seed the draft each time it opens. */
  values: Record<string, unknown>;
  onApply: (draft: Record<string, unknown>) => void;
  onReset: () => void;
  applyLabel?: string;
  resetLabel?: string;
}) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  // Edits here are staged: nothing hits the query until Apply, so a partly
  // built filter set doesn't refetch on every keystroke.
  const [draft, setDraft] = useState<Record<string, unknown>>(values);

  const open = (event: MouseEvent<HTMLElement>) => {
    setDraft(values);
    setAnchor(event.currentTarget);
  };
  const setDraftValue = (key: string, value: unknown) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  return (
    <>
      <Button
        variant="outlined"
        onClick={open}
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
              {renderControl(filter, draft, setDraftValue)}
            </Box>
          ))}
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "8px",
            mt: "16px",
            pt: "14px",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Button
            variant="outlined"
            onClick={() => {
              setDraft({});
              onReset();
              setAnchor(null);
            }}
            sx={{ flex: 1 }}
          >
            {resetLabel}
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              onApply(draft);
              setAnchor(null);
            }}
            sx={{ flex: 1 }}
          >
            {applyLabel}
          </Button>
        </Box>
      </Popover>
    </>
  );
}
