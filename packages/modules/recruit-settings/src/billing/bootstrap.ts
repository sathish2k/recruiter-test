import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsBillingComponent } from "./billing.component";
import { BillingConfiguration } from "./billing.configuration";
import { billingDatasource } from "./billing.datasource";
import fallbackTranslation from "./billing.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.SettingsBilling.Configuration",
  type: "CONFIGURATION",
  value: BillingConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsBilling.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsBilling.Datasource",
  type: "DATASOURCE",
  value: billingDatasource,
};

export const SETTINGS_BILLING_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsBilling.Component",
  type: "COMPONENT",
  value: SettingsBillingComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
