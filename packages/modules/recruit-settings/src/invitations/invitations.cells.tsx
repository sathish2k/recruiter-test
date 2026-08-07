"use client";

import type { ChipProps } from "@mui/material/Chip";
import Chip from "@mui/material/Chip";
import { IconRenderer } from "@recruit/shared";

type Row = Record<string, unknown>;
type T = (key: string, vars?: Record<string, unknown> | string) => string;

const TONE_COLOR: Record<string, ChipProps["color"]> = {
  error: "error",
  warning: "warning",
  default: "default",
};

const TONE_ICON: Record<string, string> = {
  error: "error",
  warning: "schedule",
  default: "hourglass",
};

/**
 * How long is left on the link, toned by how close it is: neutral while there
 * is time, amber in the last two days, error once it has lapsed. The API
 * decides the band so the chip and the resend button can't disagree.
 */
export function ExpiryCell(row: Row, t: T) {
  const tone = String(row.expiryTone ?? "default");
  const key = String(row.expires ?? "daysLeft");
  return (
    <Chip
      size="small"
      variant="soft"
      color={TONE_COLOR[tone] ?? "default"}
      icon={<IconRenderer name={TONE_ICON[tone] ?? "hourglass"} size={14} />}
      label={t(`expiry.${key}`, { count: Number(row.daysLeft ?? 0) })}
      sx={{ fontSize: 11.5 }}
    />
  );
}
