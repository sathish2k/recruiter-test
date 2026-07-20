import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsSecurityComponent } from "./security.component";
import { SecurityConfiguration } from "./security.configuration";
import { securityDatasource } from "./security.datasource";
import fallbackTranslation from "./security.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.SettingsSecurity.Configuration",
  type: "CONFIGURATION",
  value: SecurityConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsSecurity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsSecurity.Datasource",
  type: "DATASOURCE",
  value: securityDatasource,
};

export const SETTINGS_SECURITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsSecurity.Component",
  type: "COMPONENT",
  value: SettingsSecurityComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
