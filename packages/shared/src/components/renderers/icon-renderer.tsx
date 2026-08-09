"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import AutoFixHighRounded from "@mui/icons-material/AutoFixHighRounded";
import CheckRounded from "@mui/icons-material/CheckRounded";
import DomainRounded from "@mui/icons-material/DomainRounded";
import ErrorOutlineRounded from "@mui/icons-material/ErrorOutlineRounded";
import LinkOffRounded from "@mui/icons-material/LinkOffRounded";
import LockRounded from "@mui/icons-material/LockRounded";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import MarkEmailReadRounded from "@mui/icons-material/MarkEmailReadRounded";
import MarkEmailUnreadRounded from "@mui/icons-material/MarkEmailUnreadRounded";
import PersonOutlineRounded from "@mui/icons-material/PersonOutlineRounded";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import VisibilityOffRounded from "@mui/icons-material/VisibilityOffRounded";
import VisibilityRounded from "@mui/icons-material/VisibilityRounded";
import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import delve from "dlv";

/**
 * Registry of every icon name a configuration may reference. Only icons used
 * by shipped features are registered — an unknown name renders nothing, so
 * `bun run check:icons` gates the build on this map staying complete. Add the
 * glyph here when a new feature references it.
 */
export const ICON_REGISTRY: Record<string, SvgIconComponent> = {
  "arrow-forward": ArrowForwardRounded,
  "auto-fix-high": AutoFixHighRounded,
  check: CheckRounded,
  domain: DomainRounded,
  error: ErrorOutlineRounded,
  "link-off": LinkOffRounded,
  lock: LockRounded,
  mail: MailOutlineRounded,
  "mark-email-read": MarkEmailReadRounded,
  "mark-email-unread": MarkEmailUnreadRounded,
  person: PersonOutlineRounded,
  shield: ShieldRounded,
  visibility: VisibilityRounded,
  "visibility-off": VisibilityOffRounded,
};

export interface IconRendererConfig {
  type?: "icon";
  /** Registry key (see ICON_REGISTRY). */
  name?: string;
  /** Image source (url / data-uri / asset) — takes priority over `name`. */
  src?: string;
  /** Read the name/src out of `data` at this path (data-driven icons). */
  path?: string;
  size?: number;
  color?: string;
  /** Read the colour per row — an activity feed tints its glyph by severity. */
  colorPath?: string;
  sx?: SxProps<Theme>;
  alt?: string;
  /** Forwarded so MUI slot APIs (Chip icon, ListItemIcon, …) can style it —
   * without this their generated class never reaches the rendered element. */
  className?: string;
}

export function IconRenderer({
  name,
  src,
  path,
  size = 18,
  color,
  colorPath,
  sx,
  alt = "",
  className,
  data,
}: IconRendererConfig & { data?: Record<string, unknown> }) {
  const resolved = path ? (delve(data ?? {}, path) as string | undefined) : undefined;
  const tint = colorPath ? (delve(data ?? {}, colorPath) as string | undefined) : undefined;
  const source = src ?? (resolved && /^(https?:|data:|\/)/.test(resolved) ? resolved : undefined);
  const iconName = name ?? (source ? undefined : resolved);

  if (source) {
    return (
      <Box
        component="img"
        src={source}
        alt={alt}
        className={className}
        sx={{ width: size, height: size, objectFit: "contain", ...sx }}
      />
    );
  }
  const Icon = iconName ? ICON_REGISTRY[iconName] : undefined;
  if (!Icon) return null;
  return <Icon className={className} sx={{ fontSize: size, color: tint ?? color, ...sx }} />;
}
