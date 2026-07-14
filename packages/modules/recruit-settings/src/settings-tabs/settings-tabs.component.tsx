"use client";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { type Route, usePortalRouter, useTranslation } from "@recruit/sdk";
import type { SettingsTabItem } from "./settings-tabs.configuration";

export function SettingsTabsComponent({
  id,
  configuration,
  currentRoute,
}: {
  id: string;
  configuration?: { tabs?: SettingsTabItem[] };
  currentRoute?: Route | null;
}) {
  const { t } = useTranslation(id);
  const router = usePortalRouter();
  const tabs = configuration?.tabs ?? [];
  const active =
    tabs.find((tab) => tab.routeId === currentRoute?.id)?.routeId ??
    tabs[0]?.routeId ??
    false;

  return (
    <Tabs
      value={active}
      onChange={(_, next) => router.push(String(next))}
      variant="scrollable"
      scrollButtons={false}
      sx={{ alignSelf: "flex-start" }}
    >
      {tabs.map((tab) => (
        <Tab key={tab.routeId} value={tab.routeId} label={t(tab.label)} />
      ))}
    </Tabs>
  );
}
