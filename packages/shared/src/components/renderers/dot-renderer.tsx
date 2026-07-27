"use client";

import Box from "@mui/material/Box";
import delve from "dlv";

export interface DotRendererConfig {
  type: "dot";
  size?: number;
  /** Literal colour, or read it per-row from `colorPath`. */
  color?: string;
  colorPath?: string;
  /** Soft halo around the dot (the design's "urgent" priority marker). */
  glow?: boolean;
}

/** The small status dot used by priority rows, timelines and legends. */
export function DotRenderer({
  config,
  data = {},
}: {
  config: DotRendererConfig;
  data?: Record<string, unknown>;
}) {
  const size = config.size ?? 8;
  const color =
    (config.colorPath ? (delve(data, config.colorPath) as string) : undefined) ||
    config.color ||
    "var(--mui-palette-surface-primarySoftFg)";
  return (
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: "99px",
        background: color,
        flex: "none",
        ...(config.glow ? { boxShadow: `0 0 10px ${color}` } : {}),
      }}
    />
  );
}
