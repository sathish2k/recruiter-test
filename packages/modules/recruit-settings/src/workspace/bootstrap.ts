import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsWorkspaceComponent } from "./workspace.component";
import {
  BrandingConfiguration,
  EmailSettingsConfiguration,
  GeneralConfiguration,
  LocalizationConfiguration,
} from "./workspace.configuration";
import { organizationDatasource } from "./workspace.datasource";
import fallbackTranslation from "./workspace.translations.json";

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsWorkspace.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsWorkspace.Datasource",
  type: "DATASOURCE",
  value: organizationDatasource,
};

// The four workspace tabs are one form component over one record, differing
// only in which fields their configuration exposes. `updateOrganization` merges
// the patch, so a tab never writes a field it doesn't show.
export const SETTINGS_GENERAL_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsGeneral.Component",
  type: "COMPONENT",
  value: SettingsWorkspaceComponent,
  default: {
    configuration: {
      id: "Recruit.SettingsGeneral.Configuration",
      type: "CONFIGURATION",
      value: GeneralConfiguration,
    },
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};

export const SETTINGS_BRANDING_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsBranding.Component",
  type: "COMPONENT",
  value: SettingsWorkspaceComponent,
  default: {
    configuration: {
      id: "Recruit.SettingsBranding.Configuration",
      type: "CONFIGURATION",
      value: BrandingConfiguration,
    },
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};

export const SETTINGS_LOCALIZATION_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsLocalization.Component",
  type: "COMPONENT",
  value: SettingsWorkspaceComponent,
  default: {
    configuration: {
      id: "Recruit.SettingsLocalization.Configuration",
      type: "CONFIGURATION",
      value: LocalizationConfiguration,
    },
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};

export const SETTINGS_EMAIL_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsEmail.Component",
  type: "COMPONENT",
  value: SettingsWorkspaceComponent,
  default: {
    configuration: {
      id: "Recruit.SettingsEmail.Configuration",
      type: "CONFIGURATION",
      value: EmailSettingsConfiguration,
    },
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
