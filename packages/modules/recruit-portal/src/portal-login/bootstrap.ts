import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { PortalLoginConfiguration } from "./portal-login.configuration";
import { PortalLoginComponent } from "./portal-login.component";
import { portalLoginDatasource } from "./portal-login.datasource";
import fallbackTranslation from "./portal-login.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.ClientPortalLogin.Configuration",
  type: "CONFIGURATION",
  value: PortalLoginConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.ClientPortalLogin.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.ClientPortalLogin.Datasource",
  type: "DATASOURCE",
  value: portalLoginDatasource,
};

export const PORTAL_LOGIN_COMPONENT: ComponentDefinition = {
  id: "Recruit.ClientPortalLogin.Component",
  type: "COMPONENT",
  value: PortalLoginComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
