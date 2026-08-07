"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { createContext, type ReactNode, useContext } from "react";
import { IconRenderer } from "../../renderers/icon-renderer";

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
    <Typography
      sx={{ fontSize: 12, lineHeight: "20px", fontWeight: 700, color: "surface.textMuted" }}
    >
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
  labelAction,
  labelSuffix,
  labelIcon,
  helpPlacement = "below",
}: {
  label: string;
  hideLabel?: boolean;
  /** Already translated. */
  help?: string;
  /** Already translated; takes precedence over `help`. */
  error?: string;
  children: ReactNode;
  /** Control pinned to the right of the label row — the design's "Suggest
   * from resume" action beside a chips field. */
  labelAction?: ReactNode;
  /** Small note rendered immediately after the label text. */
  labelSuffix?: ReactNode;
  /** Icon drawn before the label — the design's grouped rejection reasons. */
  labelIcon?: ReactNode;
  /** Where `help` sits. The design puts a field's explanation under its label
   * when it explains the *choice* rather than the input. */
  helpPlacement?: "above" | "below";
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {labelAction ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <FieldLabel label={label} hide={hideLabel} />
            {labelSuffix}
          </Box>
          {labelAction}
        </Box>
      ) : labelIcon || labelSuffix ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {labelIcon}
          <FieldLabel label={label} hide={hideLabel} />
          {labelSuffix}
        </Box>
      ) : (
        <FieldLabel label={label} hide={hideLabel} />
      )}
      {help && helpPlacement === "above" && !error ? (
        <Typography sx={{ fontSize: 12, lineHeight: 1.5, color: "text.secondary" }}>
          {help}
        </Typography>
      ) : null}
      {children}
      {/* The design pairs an error with its glyph so the line reads as a state,
          not as more helper text. */}
      {error ? (
        <Typography
          role="alert"
          sx={{
            display: "flex",
            gap: "5px",
            fontSize: 11.5,
            lineHeight: 1.5,
            color: "surface.errorFg",
          }}
        >
          <IconRenderer name="error" size={14} color="inherit" />
          {error}
        </Typography>
      ) : help && helpPlacement === "below" ? (
        <Typography sx={{ fontSize: 11.5, lineHeight: 1.5, color: "text.secondary" }}>
          {help}
        </Typography>
      ) : null}
    </Box>
  );
}
