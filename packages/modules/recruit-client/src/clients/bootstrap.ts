import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientsComponent } from "./clients.component";
import { ClientsConfiguration } from "./clients.configuration";
import { clientsDatasource } from "./clients.datasource";
import fallbackTranslation from "./clients.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Clients.Configuration",
  type: "CONFIGURATION",
  value: ClientsConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.Clients.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.Clients.Datasource",
  type: "DATASOURCE",
  value: clientsDatasource,
};

export const CLIENTS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Clients.Component",
  type: "COMPONENT",
  value: ClientsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
