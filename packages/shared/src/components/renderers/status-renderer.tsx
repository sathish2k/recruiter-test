"use client";

import Box from "@mui/material/Box";
import Chip, { type ChipProps } from "@mui/material/Chip";
import { useTranslation } from "@recruit/sdk";
import delve from "dlv";

export interface StatusRendererConfig {
  type: "status";
  path: string;
  /** Component id. When set, `labels` values are treated as translation keys —
   * a missing key resolves to itself, so literal labels keep working. */
  id?: string;
  labels?: Record<string, string>;
  colors?: Record<string, ChipProps["color"]>;
  variant?: ChipProps["variant"];
  /** Render a leading dot (in the current text color) before the label. */
  dot?: boolean;
  /** Overrides the dot colour when it should differ from the label. */
  dotColor?: string;
  sx?: ChipProps["sx"];
}

export function StatusRenderer({
  config,
  data = {},
}: {
  config: StatusRendererConfig;
  data?: Record<string, unknown>;
}) {
  const { t } = useTranslation(config.id ?? "");
  const key = String(delve(data, config.path) ?? "");
  const raw = config.labels?.[key] ?? key;
  const label = config.id ? t(raw) : raw;
  return (
    <Chip
      label={
        config.dot ? (
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <Box
              component="span"
              sx={{
                width: 7,
                height: 7,
                borderRadius: "999px",
                flex: "none",
                // `dotColor` lets a status show a different dot from its text
                // (the designs use a stronger tone for the dot).
                background: config.dotColor ?? "currentColor",
              }}
            />
            {label}
          </Box>
        ) : (
          label
        )
      }
      size="small"
      variant={config.variant ?? "soft"}
      color={config.colors?.[key] ?? "default"}
      sx={[{ fontSize: 11.5 }, ...(Array.isArray(config.sx) ? config.sx : [config.sx])]}
    />
  );
}
