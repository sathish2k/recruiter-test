import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AutomationComponent } from "./automation.component";
import { AutomationConfiguration } from "./automation.configuration";
import { automationDatasource } from "./automation.datasource";
import fallbackTranslation from "./automation.translations.json";

const AUTOMATION_CONFIGURATION: ComponentDependency = {
  id: "Recruit.Automation.Configuration",
  type: "CONFIGURATION",
  value: AutomationConfiguration,
};

const AUTOMATION_TRANSLATION: ComponentDependency = {
  id: "Recruit.Automation.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const AUTOMATION_DATASOURCE: ComponentDependency = {
  id: "Recruit.Automation.Datasource",
  type: "DATASOURCE",
  value: automationDatasource,
};

export const AUTOMATION_COMPONENT: ComponentDefinition = {
  id: "Recruit.Automation.Component",
  type: "COMPONENT",
  value: AutomationComponent,
  default: {
    configuration: AUTOMATION_CONFIGURATION,
    translation: AUTOMATION_TRANSLATION,
    datasource: AUTOMATION_DATASOURCE,
  },
};
