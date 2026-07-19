import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { CommissionsComponent } from "./commissions.component";
import { CommissionsConfiguration } from "./commissions.configuration";
import { commissionsDatasource } from "./commissions.datasource";
import fallbackTranslation from "./commissions.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Commissions.Configuration",
  type: "CONFIGURATION",
  value: CommissionsConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.Commissions.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.Commissions.Datasource",
  type: "DATASOURCE",
  value: commissionsDatasource,
};

export const COMMISSIONS_COMPONENT: ComponentDefinition = {
  id: "Recruit.Commissions.Component",
  type: "COMPONENT",
  value: CommissionsComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
