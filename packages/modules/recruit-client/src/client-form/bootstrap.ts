import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientFormComponent } from "./client-form.component";
import { ClientFormConfiguration } from "./client-form.configuration";
import { clientFormDatasource } from "./client-form.datasource";
import fallbackTranslation from "./client-form.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientForm.Configuration",
  type: "CONFIGURATION",
  value: ClientFormConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientForm.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientForm.Datasource",
  type: "DATASOURCE",
  value: clientFormDatasource,
};

export const CLIENT_FORM_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientForm.Component",
  type: "COMPONENT",
  value: ClientFormComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
