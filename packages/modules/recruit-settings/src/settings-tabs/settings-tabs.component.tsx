"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { type Route, usePortalRouter, useTranslation } from "@recruit/sdk";
import type { SettingsTabItem, SettingsTabsConfiguration } from "./settings-tabs.configuration";

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

      {/* Pill group per the design: one rounded container, the active tab a
          lighter fill. No icons, no underline. */}
      <Box
        sx={{
          display: "inline-flex",
          alignSelf: "flex-start",
          flexWrap: "wrap",
          gap: "2px",
          p: "4px",
          borderRadius: "999px",
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        {tabs.map((tab) => {
          const active = tab.routeId === activeRouteId;
          return (
            <Box
              key={tab.routeId}
              onClick={() => router.push(tab.routeId)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                px: "14px",
                py: "7px",
                borderRadius: "999px",
                fontSize: 12.5,
                fontWeight: active ? 600 : 400,
                whiteSpace: "nowrap",
                cursor: "pointer",
                // The selected tab is a filled gradient pill, not a grey wash.
                background: active ? (theme) => theme.gradients.primary : "transparent",
                color: active ? "#fff" : "text.secondary",
                "&:hover": { color: active ? "#fff" : "text.primary" },
              }}
            >
              {t(tab.label)}
              {tab.badge ? (
                <Box
                  component="span"
                  sx={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: "warning.light",
                    bgcolor: "var(--mui-palette-surface-warningSoftBg)",
                    border: "1px solid var(--mui-palette-surface-warningSoftBorder)",
                    borderRadius: "999px",
                    px: "7px",
                    py: "2px",
                  }}
                >
                  {t(tab.badge)}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
