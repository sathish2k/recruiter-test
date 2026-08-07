"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import type { ActionItem } from "../renderers";
import { IconRenderer, SplitButton } from "../renderers";
import type { BulkHandler, Row, TFunc } from "./table-renderer.types";

/** Past this many, the tail folds behind the split button's caret so the bar
 * stays one line — the design's "bulk-action bar" variant of Split button. */
const INLINE_ACTIONS = 2;

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
  const run = (action?: ActionItem) => action?.type && bulkHandler?.[action.type]?.(rows);
  // The first action is the one a recruiter almost always wants; the rest are
  // its close relatives, so past a couple they belong behind one caret.
  const overflow = actions.length > INLINE_ACTIONS ? actions.slice(1) : [];
  const inline = overflow.length ? [] : actions;

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

      {inline.map((action) => (
        <Button
          key={action.type ?? action.icon}
          size="small"
          startIcon={action.icon ? <IconRenderer name={action.icon} size={14} /> : undefined}
          onClick={() => run(action)}
          sx={{ fontSize: 12, fontWeight: 600, color: "text.primary" }}
        >
          {t(action.label?.name ?? "")}
        </Button>
      ))}

      {overflow.length ? (
        <SplitButton
          size="small"
          variant="soft"
          label={t(actions[0].label?.name ?? "")}
          icon={actions[0].icon}
          onClick={() => run(actions[0])}
          options={overflow.map((action, index) => ({
            value: action.type ?? String(index),
            label: t(action.label?.name ?? ""),
            icon: action.icon,
          }))}
          onSelect={(value) => run(overflow.find((action) => action.type === value))}
        />
      ) : null}

      <Box sx={{ flex: 1 }} />
      <Button size="small" onClick={onClear} sx={{ fontSize: 12, color: "text.secondary" }}>
        {t("bulk.clear", "Clear")}
      </Button>
    </Box>
  );
}
