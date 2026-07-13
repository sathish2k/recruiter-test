"use client";

import EventRounded from "@mui/icons-material/EventRounded";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import MoreHorizRounded from "@mui/icons-material/MoreHorizRounded";
import Box from "@mui/material/Box";
import { usePortalRouter } from "@recruit/sdk";
import type { ReactNode } from "react";

export interface ActionsRendererConfig {
  type: "actions";
  actions: { icon: string; routeId?: string }[];
}

const ICONS: Record<string, ReactNode> = {
  event: <EventRounded sx={{ fontSize: 15 }} />,
  mail: <MailOutlineRounded sx={{ fontSize: 15 }} />,
  more: <MoreHorizRounded sx={{ fontSize: 15 }} />,
};

// A row of circular icon-buttons for a table row (schedule / message / more).
export function ActionsRenderer({
  config,
}: {
  config: ActionsRendererConfig;
  data?: Record<string, unknown>;
}) {
  const router = usePortalRouter();
  return (
    <Box sx={{ display: "flex", gap: "6px" }}>
      {config.actions.map((a, i) => (
        <Box
          key={a.icon ?? i}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            if (a.routeId) router.push(a.routeId);
          }}
          sx={{
            width: 29,
            height: 29,
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,.12)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#C9C5BD",
            cursor: "pointer",
            "&:hover": { background: "rgba(255,255,255,.06)" },
          }}
        >
          {ICONS[a.icon]}
        </Box>
      ))}
    </Box>
  );
}
