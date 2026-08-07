"use client";

import type { SxProps, Theme } from "@mui/material/styles";
import Typography, { type TypographyProps } from "@mui/material/Typography";
import delve from "dlv";
import { useFormatters } from "../../utils/format";

export interface TimeRendererConfig {
  type: "time";
  path: string;
  /** Adds the seconds hand. Off by default — a slot is booked to the minute. */
  seconds?: boolean;
  variant?: TypographyProps["variant"];
  color?: TypographyProps["color"];
  placeholder?: string;
  sx?: SxProps<Theme>;
}

/**
 * A time of day. 12- or 24-hour follows the workspace's own preference, which
 * `formatDate` already resolves — a recruiter booking slots should never see
 * two clock conventions on one screen.
 *
 * Accepts a full timestamp or a bare `HH:mm`, since interview slots are stored
 * both ways depending on whether the date is carried alongside.
 */
export function TimeRenderer({
  config,
  data = {},
}: {
  config: TimeRendererConfig;
  data?: Record<string, unknown>;
}) {
  const { formatDate } = useFormatters();
  const raw = delve(data, config.path);

  const value = toDate(raw);
  return (
    <Typography
      component="span"
      variant={config.variant}
      color={config.color}
      sx={{ fontVariantNumeric: "tabular-nums", ...config.sx }}
    >
      {value
        ? formatDate(value, {
            hour: "2-digit",
            minute: "2-digit",
            ...(config.seconds ? { second: "2-digit" } : {}),
          })
        : (config.placeholder ?? "")}
    </Typography>
  );
}

function toDate(raw: unknown): Date | null {
  if (raw instanceof Date) return raw;
  if (typeof raw === "number") return new Date(raw);
  if (typeof raw !== "string" || !raw) return null;

  // A bare `HH:mm` has no date to anchor it; today's does fine, since only the
  // clock portion is ever printed.
  if (/^\d{1,2}:\d{2}(:\d{2})?$/.test(raw)) {
    const [h, m, s] = raw.split(":").map(Number);
    const date = new Date();
    date.setHours(h, m, s ?? 0, 0);
    return date;
  }

  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
}
