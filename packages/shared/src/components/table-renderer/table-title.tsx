"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import type { ReactNode } from "react";
import { IconRenderer, LinkRenderer } from "../renderers";
import type { TableHeaderConfig, TFunc } from "./table-renderer.types";

export function TableTitle({
  config,
  meta,
  t,
  extra,
  action,
}: {
  config: TableHeaderConfig;
  meta?: Record<string, unknown>;
  t: TFunc;
  /** Rendered under the title — e.g. a usage meter. */
  extra?: ReactNode;
  /** Right-hand slot. Overrides `config.action` when given, so a screen can
   * put a primary button where the config would place a link chip. */
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        // A tall `extra` (a meter, a banner) tops out against the action rather
        // than centring the whole row on it.
        alignItems: extra ? "flex-start" : "center",
        justifyContent: "space-between",
        gap: "12px",
        mb: "16px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "11px", flex: 1, minWidth: 0 }}>
        {config.icon ? (
          <Avatar
            variant="rounded"
            sx={{
              width: 34,
              height: 34,
              bgcolor: "var(--mui-palette-surface-primarySoftBg)",
              border: "1px solid var(--mui-palette-surface-primarySoftBorder)",
              color: "surface.primarySoftFg",
            }}
          >
            <IconRenderer name={config.icon} size={18} />
          </Avatar>
        ) : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {config.title ? (
            <Box sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{t(config.title)}</Box>
          ) : null}
          {config.subtitle ? (
            <Box sx={{ fontSize: 11.5, color: "text.disabled", mt: "2px" }}>
              {t(config.subtitle, meta ?? {})}
            </Box>
          ) : null}
          {extra}
        </Box>
      </Box>
      <Box sx={{ flex: "none" }}>
        {action ??
          (config.action ? (
            <LinkRenderer config={config.action}>
              <Chip
                variant="soft"
                color="primary"
                clickable
                label={
                  <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {config.action.label ? t(config.action.label.name) : ""}
                    {config.actionIcon ? <IconRenderer name={config.actionIcon} size={15} /> : null}
                  </Box>
                }
                sx={{ px: "4px", py: "16px" }}
              />
            </LinkRenderer>
          ) : null)}
      </Box>
    </Box>
  );
}
