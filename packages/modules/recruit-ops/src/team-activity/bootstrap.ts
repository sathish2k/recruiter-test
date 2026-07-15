import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TeamActivityComponent } from "./team-activity.component";
import { TeamActivityConfiguration } from "./team-activity.configuration";
import { teamActivityDatasource } from "./team-activity.datasource";
import fallbackTranslation from "./team-activity.translations.json";

const TEAM_ACTIVITY_CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamActivity.Configuration",
  type: "CONFIGURATION",
  value: TeamActivityConfiguration,
};

const TEAM_ACTIVITY_TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const TEAM_ACTIVITY_DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamActivity.Datasource",
  type: "DATASOURCE",
  value: teamActivityDatasource,
};

export const TEAM_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamActivity.Component",
  type: "COMPONENT",
  value: TeamActivityComponent,
  default: {
    configuration: TEAM_ACTIVITY_CONFIGURATION,
    translation: TEAM_ACTIVITY_TRANSLATION,
    datasource: TEAM_ACTIVITY_DATASOURCE,
  },
};
