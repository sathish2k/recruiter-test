import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { teamDatasource } from "../team/team.datasource";
import { SettingsMembersComponent } from "./members.component";

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsMembers.Datasource",
  type: "DATASOURCE",
  value: teamDatasource,
};

export const SETTINGS_MEMBERS_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsMembers.Component",
  type: "COMPONENT",
  value: SettingsMembersComponent,
  default: { datasource: DATASOURCE },
};
