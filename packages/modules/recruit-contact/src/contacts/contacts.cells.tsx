"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";

type Row = Record<string, unknown>;
type T = (key: string, vars?: Record<string, unknown> | string) => string;

const AVATAR_PALETTE = [
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#5B4A3A", fg: "#FFD9BC" },
  { bg: "#3A5B4A", fg: "#CFF5E0" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
  { bg: "#5B3A3A", fg: "#F5CFCF" },
] as const;

function paletteFor(name: string) {
  let hash = 0;
  for (const char of name) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return AVATAR_PALETTE[hash % AVATAR_PALETTE.length] ?? AVATAR_PALETTE[0];
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const str = (row: Row, key: string) => (row[key] as string) ?? "";

const STATUS_COLOR: Record<string, "default" | "error"> = { left: "error" };

export function ContactCell(row: Row, t: T) {
  const name = str(row, "name") || "—";
  const title = str(row, "title");
  const dept = str(row, "department");
  const status = str(row, "status") || "active";
  const palette = paletteFor(name);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "11px", minWidth: 0 }}>
      <Avatar
        sx={{
          width: 34,
          height: 34,
          fontSize: 11.5,
          fontWeight: 700,
          bgcolor: palette.bg,
          color: palette.fg,
        }}
      >
        {initials(name)}
      </Avatar>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
          <Typography
            sx={{
              fontSize: 13.5,
              fontWeight: 600,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {name}
          </Typography>
          {row.isPrimary ? (
            <Chip variant="soft" size="small" color="primary" label={t("badges.primary")} />
          ) : null}
          {status !== "active" ? (
            <Chip
              variant="soft"
              size="small"
              color={STATUS_COLOR[status] ?? "default"}
              label={t(`status.${status}`)}
            />
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
          {[title, dept].filter(Boolean).join(" • ") || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

export function ClientCell(row: Row) {
  const client = str(row, "clientName");
  if (!client) return <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>—</Typography>;
  return <Chip variant="soft" size="small" label={client} />;
}
