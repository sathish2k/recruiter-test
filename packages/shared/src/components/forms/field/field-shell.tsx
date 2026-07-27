"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createContext, type ReactNode, useContext } from "react";

/** Set by `Field` from the schema's `required` list so any label — whichever
 * widget renders it — shows the asterisk without every widget threading a flag. */
export const FieldRequiredContext = createContext(false);

/** Already-translated "optional" suffix, set by `Field` from the schema. The design
 * appends it to the label in a dimmer, lighter weight rather than a separate line. */
export const FieldOptionalContext = createContext<string | null>(null);

export function FieldLabel({ label, hide }: { label: string; hide?: boolean }) {
  const required = useContext(FieldRequiredContext);
  const optional = useContext(FieldOptionalContext);
  if (hide) return null;
  return (
    <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: "surface.textMuted" }}>
      {label}
      {required ? (
        <Box component="span" sx={{ color: "error.main", ml: "3px" }}>
          *
        </Box>
      ) : null}
      {optional ? (
        <Box component="span" sx={{ color: "text.disabled", fontWeight: 400 }}>
          {" · "}
          {optional}
        </Box>
      ) : null}
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
