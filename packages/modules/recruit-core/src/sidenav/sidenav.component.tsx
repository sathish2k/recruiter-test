"use client";

import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import BoltRounded from "@mui/icons-material/BoltRounded";
import DomainRounded from "@mui/icons-material/DomainRounded";
import EventRounded from "@mui/icons-material/EventRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import HandshakeRounded from "@mui/icons-material/HandshakeRounded";
import HelpOutlineRounded from "@mui/icons-material/HelpOutlineRounded";
import InsightsRounded from "@mui/icons-material/InsightsRounded";
import MailRounded from "@mui/icons-material/MailRounded";
import SettingsRounded from "@mui/icons-material/SettingsRounded";
import SpaceDashboardRounded from "@mui/icons-material/SpaceDashboardRounded";
import ViewKanbanRounded from "@mui/icons-material/ViewKanbanRounded";
import WorkRounded from "@mui/icons-material/WorkRounded";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { type Route, usePortalRouter, useTranslation } from "@recruit/sdk";
import type { ReactNode } from "react";
import type { SidenavGroup } from "./sidenav.configuration";

const ICON_SX = { fontSize: 19 };
const ICONS: Record<string, ReactNode> = {
  dashboard: <SpaceDashboardRounded sx={ICON_SX} />,
  domain: <DomainRounded sx={ICON_SX} />,
  work: <WorkRounded sx={ICON_SX} />,
  group: <GroupRounded sx={ICON_SX} />,
  kanban: <ViewKanbanRounded sx={ICON_SX} />,
  monitoring: <InsightsRounded sx={ICON_SX} />,
  event: <EventRounded sx={ICON_SX} />,
  handshake: <HandshakeRounded sx={ICON_SX} />,
  mail: <MailRounded sx={ICON_SX} />,
  aiScreening: <AutoAwesomeRounded sx={ICON_SX} />,
  automation: <BoltRounded sx={ICON_SX} />,
  settings: <SettingsRounded sx={ICON_SX} />,
  help: <HelpOutlineRounded sx={ICON_SX} />,
};

export function SidenavComponent({
  id,
  configuration,
  currentRoute,
}: {
  id: string;
  configuration?: { groups?: SidenavGroup[] };
  currentRoute?: Route | null;
}) {
  const router = usePortalRouter();
  const { t } = useTranslation(id);
  const groups = configuration?.groups ?? [];

  return (
    <Box
      component="aside"
      sx={{
        width: 248,
        flexShrink: 0,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,.06)",
        p: "22px 18px",
        height: "100vh",
        overflowY: "auto",
      }}
    >
      <Box
        sx={{ display: "flex", alignItems: "center", gap: "10px", mb: "26px" }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            borderRadius: "9px",
            background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: 15,
            color: "#fff",
          }}
        >
          {t("brand").charAt(0)}
        </Box>
        <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
          {t("brand")}
        </Typography>
      </Box>

      {groups.map((group, gi) => (
        <Box key={group.title}>
          {gi > 0 ? (
            <Box
              sx={{
                height: "1px",
                bgcolor: "rgba(255,255,255,.07)",
                my: "20px",
              }}
            />
          ) : null}
          <Typography
            sx={{
              fontSize: 11,
              letterSpacing: ".12em",
              color: "#7C7972",
              mt: gi === 0 ? "6px" : 0,
              mb: "10px",
            }}
          >
            {t(group.title)}
          </Typography>
          <Box
            component="nav"
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              borderLeft: "1px solid rgba(255,255,255,.07)",
              pl: "10px",
            }}
          >
            {group.items.map((item) => {
              const active = item.routeId === currentRoute?.id;
              return (
                <Box
                  key={item.routeId}
                  onClick={() => router.push(item.routeId)}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    p: "9px 12px",
                    borderRadius: "9px",
                    fontSize: 13.5,
                    cursor: "pointer",
                    border: "1px solid transparent",
                    ...(active
                      ? {
                          background:
                            "linear-gradient(90deg,rgba(242,106,27,.28),rgba(242,106,27,.05))",
                          borderColor: "rgba(242,106,27,.35)",
                          fontWeight: 600,
                          color: "#ECEAE7",
                        }
                      : {
                          color: "#9A968E",
                          "&:hover": {
                            background: "rgba(255,255,255,.05)",
                            color: "#ECEAE7",
                          },
                        }),
                  }}
                >
                  {ICONS[item.icon]}
                  {t(item.label)}
                </Box>
              );
            })}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
