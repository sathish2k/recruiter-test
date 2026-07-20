"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { IconRenderer, LinkRenderer } from "../renderers";
import type { TableHeaderConfig, TFunc } from "./table-renderer.types";

export function TableTitle({
  config,
  meta,
  t,
}: {
  config: TableHeaderConfig;
  meta?: Record<string, unknown>;
  t: TFunc;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        mb: "16px",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
        {config.icon ? (
          <Avatar
            variant="rounded"
            sx={{
              width: 34,
              height: 34,
              bgcolor: "rgba(242,106,27,.12)",
              border: "1px solid rgba(242,106,27,.28)",
              color: "#F0B27C",
            }}
          >
            <IconRenderer name={config.icon} size={18} />
          </Avatar>
        ) : null}
        <Box>
          {config.title ? (
            <Box sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>{t(config.title)}</Box>
          ) : null}
          {config.subtitle ? (
            <Box sx={{ fontSize: 11.5, color: "text.disabled", mt: "2px" }}>
              {t(config.subtitle, meta ?? {})}
            </Box>
          ) : null}
        </Box>
      </Box>
      {config.action ? (
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
      ) : null}
    </Box>
  );
}
