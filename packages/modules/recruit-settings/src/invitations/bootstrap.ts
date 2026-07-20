import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsInvitationsComponent } from "./invitations.component";
import { InvitationsConfiguration } from "./invitations.configuration";
import { invitationsDatasource } from "./invitations.datasource";
import fallbackTranslation from "./invitations.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.SettingsInvitations.Configuration",
  type: "CONFIGURATION",
  value: InvitationsConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsInvitations.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsInvitations.Datasource",
  type: "DATASOURCE",
  value: invitationsDatasource,
};

export const SETTINGS_INVITATIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsInvitations.Component",
  type: "COMPONENT",
  value: SettingsInvitationsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
