"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { ActionItem } from "../renderers";
import { IconRenderer } from "../renderers";
import type { BulkHandler, Row, TFunc } from "./table-renderer.types";

/**
 * The strip that appears once rows are picked: how many, what you can do to
 * them, and a way out. Each action dispatches through the screen's
 * `actionHandler` with the selected rows, so the table stays behaviour-free.
 */
export function TableBulkBar({
  count,
  actions,
  rows,
  bulkHandler,
  onClear,
  t,
}: {
  count: number;
  actions: ActionItem[];
  rows: Row[];
  bulkHandler?: BulkHandler;
  onClear: () => void;
  t: TFunc;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap",
        mb: "12px",
        p: "8px 12px",
        borderRadius: "999px",
        bgcolor: "surface.optionSelectedBg",
        border: "1px solid",
        borderColor: "surface.primarySoftBorder",
      }}
    >
      <Box sx={{ fontSize: 12.5, fontWeight: 700, color: "surface.accentBright" }}>
        {t("bulk.count", { count })}
      </Box>

      {actions.map((action) => (
        <Button
          key={action.type ?? action.icon}
          size="small"
          startIcon={action.icon ? <IconRenderer name={action.icon} size={14} /> : undefined}
          onClick={() => action.type && bulkHandler?.[action.type]?.(rows)}
          sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}
        >
          {t(action.label?.name ?? "")}
        </Button>
      ))}

      <Box sx={{ flex: 1 }} />
      <Button size="small" onClick={onClear} sx={{ fontSize: 12, color: "text.secondary" }}>
        {t("bulk.clear", "Clear")}
      </Button>
    </Box>
  );
}
