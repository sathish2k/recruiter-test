"use client";

import MailRounded from "@mui/icons-material/MailRounded";
import NotificationsRounded from "@mui/icons-material/NotificationsRounded";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  type Route,
  useAuthUser,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import type { ReactNode } from "react";
import type { AppbarAction } from "./appbar.configuration";

function initials(name?: string | null): string {
  if (!name) return "";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

const ICONS: Record<string, ReactNode> = {
  notifications: <NotificationsRounded sx={{ fontSize: 16 }} />,
  mail: <MailRounded sx={{ fontSize: 16 }} />,
};

const iconButtonSx = {
  position: "relative",
  width: 32,
  height: 32,
  borderRadius: "999px",
  border: "1px solid rgba(255,255,255,.12)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#9A968E",
  cursor: "pointer",
  "&:hover": { background: "rgba(255,255,255,.06)", color: "#ECEAE7" },
} as const;

export function AppbarComponent({
  id,
  configuration,
  currentRoute,
}: {
  id: string;
  configuration?: {
    titles?: Record<string, string>;
    actions?: AppbarAction[];
  };
  currentRoute?: Route | null;
}) {
  const router = usePortalRouter();
  const { t } = useTranslation(id);
  const user = useAuthUser();
  const titleKey = configuration?.titles?.[currentRoute?.id ?? ""];
  const actions = configuration?.actions ?? [];

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: "26px",
        py: "16px",
        borderBottom: "1px solid rgba(255,255,255,.06)",
      }}
    >
      <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
        {titleKey ? t(titleKey) : ""}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {actions.map((action) => {
          const go = () => action.routeId && router.push(action.routeId);
          if (action.kind === "avatar") {
            return (
              <Box
                key="avatar"
                onClick={go}
                title={user?.name ?? undefined}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "999px",
                  background: "#5B4A3A",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "#FFD9BC",
                  cursor: "pointer",
                }}
              >
                {initials(user?.name) || t(action.label ?? "")}
              </Box>
            );
          }
          return (
            <Box key={action.icon} onClick={go} sx={iconButtonSx}>
              {ICONS[action.icon ?? ""]}
              {action.badge ? (
                <Box
                  sx={{
                    position: "absolute",
                    top: 5,
                    right: 6,
                    width: 7,
                    height: 7,
                    borderRadius: "999px",
                    background: "#F26A1B",
                    border: "2px solid #131313",
                  }}
                />
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
