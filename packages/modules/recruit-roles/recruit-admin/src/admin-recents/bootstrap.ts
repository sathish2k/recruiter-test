import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { AdminRecentsConfiguration } from "./admin-recents.configuration";
import { adminRecentsDatasource } from "./admin-recents.datasource";
import fallbackTranslation from "./admin-recents.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardRecents.Configuration",
  type: "CONFIGURATION",
  value: AdminRecentsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Admin.DashboardRecents.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Admin.DashboardRecents.Datasource",
  type: "DATASOURCE",
  value: adminRecentsDatasource,
};

export const ADMIN_RECENTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Admin.DashboardRecents.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
