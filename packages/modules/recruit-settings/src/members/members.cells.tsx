"use client";

import Box from "@mui/material/Box";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconRenderer } from "@recruit/shared";

/** A member row as the table sees it. */
type Row = Record<string, unknown>;

/** Matches the translation hook's signature, including i18next interpolation. */
type T = (key: string, vars?: Record<string, unknown> | string) => string;

const str = (row: Row, key: string) => (row[key] as string) ?? "";

/**
 * Client access: one chip per client the member can see, with the overflow
 * rolled into a `+N` chip. Empty means the whole book, which the design shows
 * as a muted dash rather than an empty cell.
 */
export function ClientAccessCell(row: Row, t: T, onManage?: (row: Row) => void, max = 2) {
  const stored = Array.isArray(row.clientAccess) ? (row.clientAccess as string[]) : [];
  // Unrestricted access still reads as a chip, matching every other value.
  const clients = stored.length ? stored : [t("access.all")];
  const shown = clients.slice(0, max);
  const rest = clients.length - shown.length;

  return (
    // The whole cell is the affordance in the design: a hover-highlighted,
    // rounded target that opens access management. The negative margin lets
    // that highlight bleed past the text without shifting the row.
    <Box
      title={t("access.manage")}
      onClick={onManage ? () => onManage(row) : undefined}
      sx={{
        display: "flex",
        flexWrap: "wrap",
        gap: "5px",
        alignItems: "center",
        m: "-4px",
        p: "4px",
        borderRadius: "9px",
        cursor: onManage ? "pointer" : "default",
        "&:hover": onManage ? { bgcolor: "rgba(255,255,255,.04)" } : undefined,
      }}
    >
      {shown.map((name) => (
        <Box
          key={name}
          sx={{
            fontSize: 11,
            fontWeight: 600,
            color: "surface.textMuted",
            bgcolor: "surface.hover",
            border: "1px solid",
            borderColor: "surface.controlBorder",
            px: "10px",
            py: "3px",
            borderRadius: "999px",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </Box>
      ))}
      {rest > 0 ? (
        <Box
          sx={{
            fontSize: 11,
            fontWeight: 700,
            color: "surface.primarySoftFg",
            bgcolor: "rgba(242,106,27,.1)",
            border: "1px solid rgba(242,106,27,.3)",
            px: "10px",
            py: "3px",
            borderRadius: "999px",
            whiteSpace: "nowrap",
          }}
        >
          {t("access.more", { count: rest })}
        </Box>
      ) : null}
      {/* Owner access is fixed; everyone else's is editable from here. */}
      <IconRenderer
        name={row.isOwner ? "lock" : "edit"}
        size={14}
        sx={{ color: "text.disabled", p: "2px" }}
      />
    </Box>
  );
}

/** MFA state as plain icon + label — no chip, unlike the status column. */
export function MfaCell(row: Row, t: T) {
  const on = !!row.mfaEnabled;
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
      <IconRenderer
        name={on ? "check-circle" : "warning"}
        size={14}
        sx={{ color: on ? "surface.successFg" : "warning.light" }}
      />
      <Typography
        sx={{
          fontSize: 11,
          fontWeight: 600,
          color: on ? "surface.successFg" : "warning.light",
          whiteSpace: "nowrap",
        }}
      >
        {on ? t("mfa.on") : t("mfa.off")}
      </Typography>
    </Box>
  );
}

/** Relative label with the absolute timestamp behind a tooltip. */
export function LastActiveCell(row: Row) {
  return (
    <Tooltip title={str(row, "lastActiveFull")} placement="top">
      <Typography
        sx={{
          fontSize: 12.5,
          color: "text.secondary",
          whiteSpace: "nowrap",
          cursor: "help",
          display: "inline-block",
        }}
      >
        {str(row, "lastActive")}
      </Typography>
    </Tooltip>
  );
}
