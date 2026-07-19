import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ClientPortalConfiguration } from "./client-portal.configuration";
import { ClientPortalComponent } from "./client-portal.component";
import { clientPortalDatasource } from "./client-portal.datasource";
import fallbackTranslation from "./client-portal.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientPortal.Configuration",
  type: "CONFIGURATION",
  value: ClientPortalConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientPortal.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientPortal.Datasource",
  type: "DATASOURCE",
  value: clientPortalDatasource,
};

export const CLIENT_PORTAL_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientPortal.Component",
  type: "COMPONENT",
  value: ClientPortalComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
