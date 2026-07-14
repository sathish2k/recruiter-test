import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TeamComponent } from "./team.component";
import { TeamConfiguration } from "./team.configuration";
import { teamDatasource } from "./team.datasource";
import fallbackTranslation from "./team.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Settings.Configuration",
  type: "CONFIGURATION",
  value: TeamConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.Settings.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.Settings.Datasource",
  type: "DATASOURCE",
  value: teamDatasource,
};

export const TEAM_COMPONENT: ComponentDefinition = {
  id: "Recruit.Settings.Component",
  type: "COMPONENT",
  value: TeamComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
