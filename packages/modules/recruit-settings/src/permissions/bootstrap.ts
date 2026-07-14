import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { PermissionsComponent } from "./permissions.component";
import { PermissionsConfiguration } from "./permissions.configuration";
import { permissionsDatasource } from "./permissions.datasource";
import fallbackTranslation from "./permissions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Permissions.Configuration",
  type: "CONFIGURATION",
  value: PermissionsConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.Permissions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.Permissions.Datasource",
  type: "DATASOURCE",
  value: permissionsDatasource,
};

export const PERMISSIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Permissions.Component",
  type: "COMPONENT",
  value: PermissionsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
