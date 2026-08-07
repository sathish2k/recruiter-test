import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { SourcerSideConfiguration } from "./sourcer-side.configuration";
import { sourcerSideDatasource } from "./sourcer-side.datasource";
import fallbackTranslation from "./sourcer-side.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardSide.Configuration",
  type: "CONFIGURATION",
  value: SourcerSideConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardSide.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Sourcer.DashboardSide.Datasource",
  type: "DATASOURCE",
  value: sourcerSideDatasource,
};

export const SOURCER_SIDE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Sourcer.DashboardSide.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
