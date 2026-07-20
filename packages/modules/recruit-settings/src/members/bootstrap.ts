import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { teamDatasource } from "../team/team.datasource";
import { SettingsMembersComponent } from "./members.component";
import { MembersConfiguration } from "./members.configuration";
import fallbackTranslation from "./members.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.SettingsMembers.Configuration",
  type: "CONFIGURATION",
  value: MembersConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsMembers.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsMembers.Datasource",
  type: "DATASOURCE",
  value: teamDatasource,
};

export const SETTINGS_MEMBERS_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsMembers.Component",
  type: "COMPONENT",
  value: SettingsMembersComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
