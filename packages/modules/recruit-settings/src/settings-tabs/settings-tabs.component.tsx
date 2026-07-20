"use client";

import type { SvgIconComponent } from "@mui/icons-material";
import AdminPanelSettingsRounded from "@mui/icons-material/AdminPanelSettingsRounded";
import BusinessRounded from "@mui/icons-material/BusinessRounded";
import CreditCardRounded from "@mui/icons-material/CreditCardRounded";
import GroupRounded from "@mui/icons-material/GroupRounded";
import HistoryRounded from "@mui/icons-material/HistoryRounded";
import HubRounded from "@mui/icons-material/HubRounded";
import MailOutlineRounded from "@mui/icons-material/MailOutlineRounded";
import ShieldRounded from "@mui/icons-material/ShieldRounded";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { type Route, usePortalRouter, useTranslation } from "@recruit/sdk";
import type { SettingsTabItem, SettingsTabsConfiguration } from "./settings-tabs.configuration";

const ICONS: Record<string, SvgIconComponent> = {
  workspace: BusinessRounded,
  members: GroupRounded,
  roles: AdminPanelSettingsRounded,
  templates: MailOutlineRounded,
  billing: CreditCardRounded,
  integrations: HubRounded,
  security: ShieldRounded,
  auditLog: HistoryRounded,
};

export function SettingsTabsComponent({
  id,
  configuration,
  currentRoute,
}: {
  id: string;
  configuration?: Partial<SettingsTabsConfiguration> & { tabs?: SettingsTabItem[] };
  currentRoute?: Route | null;
}) {
  const { t } = useTranslation(id);
  const router = usePortalRouter();
  const tabs = configuration?.tabs ?? [];
  const activeRouteId =
    tabs.find((tab) => tab.routeId === currentRoute?.id)?.routeId ?? tabs[0]?.routeId;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <Box>
        <Typography sx={{ fontSize: 17, fontWeight: 600 }}>
          {t(configuration?.title ?? "title")}
        </Typography>
        <Typography sx={{ fontSize: 12.5, color: "text.disabled", mt: "2px" }}>
          {t(configuration?.subtitle ?? "subtitle")}
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: "4px", borderBottom: "1px solid", borderColor: "divider" }}>
        {tabs.map((tab) => {
          const Icon = ICONS[tab.icon];
          const active = tab.routeId === activeRouteId;
          return (
            <Box
              key={tab.routeId}
              onClick={() => router.push(tab.routeId)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                px: "16px",
                py: "11px",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                mb: "-1px",
                borderBottom: "2px solid",
                borderColor: active ? "primary.main" : "transparent",
                color: active ? "text.primary" : "text.secondary",
                "&:hover": { color: "text.primary" },
              }}
            >
              {Icon ? <Icon sx={{ fontSize: 16 }} /> : null}
              {t(tab.label)}
              {tab.badge ? (
                <Chip variant="soft" size="small" color="warning" label={t(tab.badge)} />
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
