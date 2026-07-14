"use client";

import Box from "@mui/material/Box";
import { IconRenderer, LinkRenderer } from "../renderers";
import type { TableHeaderConfig, TFunc } from "./table-renderer.types";

// The optional titled header row rendered inside the table card: a leading
// icon tile + title + (meta-interpolated) subtitle, and a trailing link.
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
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: "10px",
              background: "rgba(242,106,27,.12)",
              border: "1px solid rgba(242,106,27,.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#F0B27C",
              flex: "none",
            }}
          >
            <IconRenderer name={config.icon} size={18} />
          </Box>
        ) : null}
        <Box>
          {config.title ? (
            <Box sx={{ fontSize: 15, fontWeight: 700, lineHeight: 1.2 }}>
              {t(config.title)}
            </Box>
          ) : null}
          {config.subtitle ? (
            <Box sx={{ fontSize: 11.5, color: "#7C7972", mt: "2px" }}>
              {t(config.subtitle, meta ?? {})}
            </Box>
          ) : null}
        </Box>
      </Box>
      {config.action ? (
        <LinkRenderer config={config.action}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: 12.5,
              fontWeight: 600,
              color: "#F0B27C",
              whiteSpace: "nowrap",
              p: "7px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(242,106,27,.32)",
              background: "rgba(242,106,27,.1)",
              cursor: "pointer",
              "&:hover": {
                background: "rgba(242,106,27,.18)",
                color: "#FF8A3C",
              },
            }}
          >
            {config.action.label ? t(config.action.label.name) : ""}
            {config.actionIcon ? (
              <IconRenderer name={config.actionIcon} size={15} />
            ) : null}
          </Box>
        </LinkRenderer>
      ) : null}
    </Box>
  );
}
