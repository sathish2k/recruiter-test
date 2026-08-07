"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

/** A member row as the table sees it. */
type Row = Record<string, unknown>;

/** Matches the translation hook's signature, including i18next interpolation. */
type T = (key: string, vars?: Record<string, unknown> | string) => string;

const str = (row: Row, key: string) => (row[key] as string) ?? "";

/** Presence is a freshness band, not a session — see the API's `presenceOf`. */
const PRESENCE_COLOR: Record<string, string> = {
  online: "var(--mui-palette-success-main)",
  away: "var(--mui-palette-warning-main)",
  offline: "var(--mui-palette-text-disabled)",
};

function presenceColor(row: Row) {
  return PRESENCE_COLOR[str(row, "presence")] ?? PRESENCE_COLOR.offline;
}

/**
 * Avatar, name and address — with presence riding on the avatar as a dot, so
 * "who is around" reads from the same glance as "who is here". The YOU badge
 * marks your own row, which several actions refuse to touch.
 */
export function MemberCell(row: Row, t: T) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
      <Box sx={{ position: "relative", flex: "none" }}>
        <Avatar
          sx={{
            width: 36,
            height: 36,
            fontSize: 12,
            fontWeight: 700,
            bgcolor: str(row, "avatarBg"),
            color: str(row, "avatarFg"),
          }}
        >
          {str(row, "initials")}
        </Avatar>
        <Tooltip title={t(`presence.${str(row, "presence") || "offline"}`)} placement="top">
          <Box
            sx={{
              position: "absolute",
              right: -1,
              bottom: -1,
              width: 11,
              height: 11,
              borderRadius: "999px",
              bgcolor: presenceColor(row),
              border: "2px solid",
              borderColor: "background.paper",
            }}
          />
        </Tooltip>
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {str(row, "displayName")}
          </Typography>
          {row.isCurrentUser ? (
            <Chip variant="badge" color="primary" size="small" label={t("you")} />
          ) : null}
        </Box>
        <Typography
          sx={{
            fontSize: 11.5,
            color: "text.disabled",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {str(row, "email")}
        </Typography>
      </Box>
    </Box>
  );
}

/** Relative label with the absolute timestamp behind a tooltip, over the
 * presence word the dot on the avatar shows without saying. */
export function LastActiveCell(row: Row, t: T) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Tooltip title={str(row, "lastActiveFull")} placement="top">
        <Typography
          sx={{
            fontSize: 12,
            color: "text.secondary",
            whiteSpace: "nowrap",
            cursor: "help",
            display: "inline-block",
          }}
        >
          {str(row, "lastActive")}
        </Typography>
      </Tooltip>
      <Box sx={{ display: "flex", alignItems: "center", gap: "5px", mt: "1px" }}>
        <Box
          sx={{
            width: 6,
            height: 6,
            flex: "none",
            borderRadius: "999px",
            bgcolor: presenceColor(row),
          }}
        />
        <Typography sx={{ fontSize: 10.5, color: "text.disabled" }}>
          {t(`presence.${str(row, "presence") || "offline"}`)}
        </Typography>
      </Box>
    </Box>
  );
}
