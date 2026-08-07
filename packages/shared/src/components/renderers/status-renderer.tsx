"use client";

import Box from "@mui/material/Box";
import Chip, { type ChipProps } from "@mui/material/Chip";
import { useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { IconRenderer } from "./icon-renderer";

export interface StatusRendererConfig {
  /** Render nothing when the value has no entry in `labels` — for a badge that
   * marks one state and stays absent otherwise. */
  onlyMapped?: boolean;
  type: "status";
  path: string;
  /** Component id. When set, `labels` values are treated as translation keys —
   * a missing key resolves to itself, so literal labels keep working. */
  id?: string;
  labels?: Record<string, string>;
  colors?: Record<string, ChipProps["color"]>;
  /** Value → ICON_REGISTRY name drawn before the label, where the glyph carries
   * the state as much as the wording does (a member's active/invited/off). */
  icons?: Record<string, string>;
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
  const mapped = config.labels?.[key];
  const raw = mapped ?? key;
  const label = config.id ? t(raw) : raw;
  // A labels map that covers only some values is a badge that shows for those
  // values alone — the design`s PRIMARY marker, absent on everyone else.
  if (config.labels && mapped === undefined && config.onlyMapped) return null;

  const icon = config.icons?.[key];

  return (
    <Chip
      label={
        icon ? (
          <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "5px" }}>
            <IconRenderer name={icon} size={14} color="inherit" />
            {label}
          </Box>
        ) : config.dot ? (
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
