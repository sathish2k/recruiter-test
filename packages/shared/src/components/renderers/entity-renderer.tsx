import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import delve from "dlv";
import type { ReactNode } from "react";
import { IconRenderer } from "./icon-renderer";

export interface EntityRendererConfig {
  type: "entity";
  /** "square" (logo tile) or "circle" (avatar). */
  shape?: "square" | "circle";
  size?: number;
  /** Background — a literal color or a data path. */
  bg?: string;
  bgPath?: string;
  fg?: string;
  fgPath?: string;
  /** Render the avatar alone, deriving its initials from `title` — for a list
   * row`s leading slot, where the row already prints the name. */
  avatarOnly?: boolean;
  /** The tile/avatar text (initial or initials) — literal or data path. */
  text?: string;
  textPath?: string;
  /** ICON_REGISTRY name drawn inside the tile instead of initials — the
   * requirement header's `work` glyph, where a record has no name to initial. */
  icon?: string;
  /** CSS background applied over `bg`, for the design's gradient tiles. */
  gradient?: string;
  /** When set (and no explicit bg/fg), the avatar colour is picked from a fixed
   * palette by hashing this field — stable per-identity swatches with no data
   * plumbing. */
  hashPath?: string;
  /** Data path for the primary title. */
  title: string;
  /** Data path for the secondary subtitle. */
  subtitle?: string;
  /** Boolean data path; when truthy, `suffixLabel` follows the title. */
  suffixPath?: string;
  /** Defaults to "(you)". */
  suffixLabel?: string;
  /** Type overrides, so a feature card can size the block without a bespoke
   * copy of this renderer. */
  avatarSx?: SxProps<Theme>;
  titleSx?: SxProps<Theme>;
  subtitleSx?: SxProps<Theme>;
}

const read = (data: Record<string, unknown>, path?: string, literal?: string) =>
  path ? String(delve(data, path) ?? "") : (literal ?? "");

// Fixed identity swatches — colour, not chrome, so they stay literal.
const HASH_PALETTE = [
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#5B4A3A", fg: "#FFD9BC" },
  { bg: "#3A5B4A", fg: "#CFF5E0" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
  { bg: "#5B3A3A", fg: "#F5CFCF" },
  { bg: "#4A5B3A", fg: "#E0F5CF" },
] as const;

function hashSwatch(value: string) {
  let hash = 0;
  for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return HASH_PALETTE[hash % HASH_PALETTE.length] ?? HASH_PALETTE[0];
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function EntityRenderer({
  config,
  data = {},
  titleAdornment,
}: {
  config: EntityRendererConfig;
  data?: Record<string, unknown>;
  /** Rendered inline after the title — the design`s state chips beside a name. */
  titleAdornment?: ReactNode;
}) {
  const circle = config.shape === "circle";
  const size = config.size ?? 34;
  const swatch = config.hashPath ? hashSwatch(read(data, config.hashPath)) : undefined;
  const bg =
    read(data, config.bgPath, config.bg) || swatch?.bg || "var(--mui-palette-surface-neutral)";
  const fg =
    read(data, config.fgPath, config.fg) || swatch?.fg || "var(--mui-palette-surface-textMuted)";
  // Explicit text/textPath wins; otherwise derive initials from the title.
  const avatarText =
    read(data, config.textPath, config.text) || initialsOf(read(data, config.title));
  const avatar = (
    <Avatar
      variant={circle ? "circular" : "rounded"}
      sx={{
        width: size,
        height: size,
        bgcolor: bg,
        background: config.gradient,
        color: fg,
        fontSize: circle ? 12 : 13,
        fontWeight: circle ? 600 : 700,
        ...config.avatarSx,
      }}
    >
      {config.icon ? (
        <IconRenderer name={config.icon} size={Math.round(size * 0.47)} />
      ) : (
        avatarText
      )}
    </Avatar>
  );

  if (config.avatarOnly) return avatar;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
      {avatar}
      <Box sx={{ minWidth: 0 }}>
        <Box
          sx={{
            display: titleAdornment ? "flex" : undefined,
            alignItems: titleAdornment ? "center" : undefined,
            gap: titleAdornment ? "10px" : undefined,
            flexWrap: titleAdornment ? "wrap" : undefined,
            fontWeight: 600,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            ...config.titleSx,
          }}
        >
          {titleAdornment ? (
            <Box component="span" sx={{ minWidth: 0 }}>
              {read(data, config.title)}
            </Box>
          ) : (
            read(data, config.title)
          )}
          {config.suffixPath && data?.[config.suffixPath] ? (
            <Box
              component="span"
              sx={{ fontSize: 11.5, fontWeight: 400, color: "text.disabled", ml: "5px" }}
            >
              {config.suffixLabel ?? "(you)"}
            </Box>
          ) : null}
          {titleAdornment}
        </Box>
        {config.subtitle ? (
          <Box
            sx={{
              fontSize: 11.5,
              color: "text.disabled",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              ...config.subtitleSx,
            }}
          >
            {read(data, config.subtitle)}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}
