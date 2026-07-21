"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

export function FieldLabel({ label, hide }: { label: string; hide?: boolean }) {
  if (hide) return null;
  return (
    <Typography sx={{ fontSize: 12, fontWeight: 600, color: "surface.textMuted" }}>
      {label}
    </Typography>
  );
}

/**
 * Label + control + helper/error line. Every widget that isn't self-labelling
 * renders through this, so spacing and error styling stay identical across the
 * form regardless of which widget a field uses.
 */
export function FieldShell({
  label,
  hideLabel,
  help,
  error,
  children,
}: {
  label: string;
  hideLabel?: boolean;
  /** Already translated. */
  help?: string;
  /** Already translated; takes precedence over `help`. */
  error?: string;
  children: ReactNode;
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "7px" }}>
      <FieldLabel label={label} hide={hideLabel} />
      {children}
      {error ? (
        <Typography sx={{ fontSize: 11, color: "error.main" }}>{error}</Typography>
      ) : help ? (
        <Typography sx={{ fontSize: 11, color: "text.disabled" }}>{help}</Typography>
      ) : null}
    </Box>
  );
}
