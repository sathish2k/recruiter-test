import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { StatusChipsRenderer } from "@recruit/shared";
import { OwnerStatusConfiguration } from "./owner-status.configuration";
import { ownerStatusDatasource } from "./owner-status.datasource";
import fallbackTranslation from "./owner-status.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardStatus.Configuration",
  type: "CONFIGURATION",
  value: OwnerStatusConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardStatus.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardStatus.Datasource",
  type: "DATASOURCE",
  value: ownerStatusDatasource,
};

export const OWNER_STATUS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardStatus.Component",
  type: "COMPONENT",
  value: StatusChipsRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
