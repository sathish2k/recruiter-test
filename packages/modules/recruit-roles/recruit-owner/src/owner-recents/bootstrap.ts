import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { OwnerRecentsConfiguration } from "./owner-recents.configuration";
import { ownerRecentsDatasource } from "./owner-recents.datasource";
import fallbackTranslation from "./owner-recents.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardRecents.Configuration",
  type: "CONFIGURATION",
  value: OwnerRecentsConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardRecents.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardRecents.Datasource",
  type: "DATASOURCE",
  value: ownerRecentsDatasource,
};

export const OWNER_RECENTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardRecents.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
