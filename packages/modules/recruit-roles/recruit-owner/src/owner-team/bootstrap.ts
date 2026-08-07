import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TableRenderer } from "@recruit/shared";
import { OwnerTeamConfiguration } from "./owner-team.configuration";
import { ownerTeamDatasource } from "./owner-team.datasource";
import fallbackTranslation from "./owner-team.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardTeam.Configuration",
  type: "CONFIGURATION",
  value: OwnerTeamConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardTeam.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardTeam.Datasource",
  type: "DATASOURCE",
  value: ownerTeamDatasource,
};

export const OWNER_TEAM_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardTeam.Component",
  type: "COMPONENT",
  value: TableRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
