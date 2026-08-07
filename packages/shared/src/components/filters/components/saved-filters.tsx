"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { IconRenderer } from "../../renderers/icon-renderer";
import type { FilterValue } from "../use-filters";
import type { SavedFilter } from "../use-saved-filters";

/**
 * The saved sets, as pills beside the filter bar. One click restores a set;
 * the delete affordance only appears on the pill you are pointing at, so the
 * row stays quiet until you reach for it.
 */
export function SavedFilters({
  saved,
  activeId,
  onApply,
  onRemove,
  onSave,
  canSave,
  saveLabel = "Save view",
}: {
  saved: SavedFilter[];
  activeId: string | null;
  onApply: (filters: FilterValue) => void;
  onRemove: (id: string) => void;
  /** Prompts for a name and stores the current set. */
  onSave: () => void;
  /** False when nothing is filtered — there is no view to save. */
  canSave: boolean;
  saveLabel?: string;
}) {
  if (!saved.length && !canSave) return null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      {saved.map((entry) => (
        <Chip
          key={entry.id}
          variant="pill"
          color={entry.id === activeId ? "primary" : "default"}
          label={entry.name}
          onClick={() => onApply(entry.filters)}
          onDelete={() => onRemove(entry.id)}
          deleteIcon={<IconRenderer name="close" size={13} />}
        />
      ))}
      {canSave ? (
        <Chip
          variant="pill"
          color="default"
          label={saveLabel}
          icon={<IconRenderer name="add" size={13} />}
          onClick={onSave}
        />
      ) : null}
    </Box>
  );
}
