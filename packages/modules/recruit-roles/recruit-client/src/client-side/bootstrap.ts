import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { ClientSideConfiguration } from "./client-side.configuration";
import { clientSideDatasource } from "./client-side.datasource";
import fallbackTranslation from "./client-side.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Client.DashboardSide.Configuration",
  type: "CONFIGURATION",
  value: ClientSideConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Client.DashboardSide.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Client.DashboardSide.Datasource",
  type: "DATASOURCE",
  value: clientSideDatasource,
};

export const CLIENT_SIDE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Client.DashboardSide.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
