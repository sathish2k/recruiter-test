import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsIntegrationsComponent } from "./integrations.component";
import { IntegrationsConfiguration } from "./integrations.configuration";
import { integrationsDatasource } from "./integrations.datasource";
import fallbackTranslation from "./integrations.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.SettingsIntegrations.Configuration",
  type: "CONFIGURATION",
  value: IntegrationsConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsIntegrations.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsIntegrations.Datasource",
  type: "DATASOURCE",
  value: integrationsDatasource,
};

export const SETTINGS_INTEGRATIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsIntegrations.Component",
  type: "COMPONENT",
  value: SettingsIntegrationsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
