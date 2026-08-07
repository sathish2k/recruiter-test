import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SideListRenderer } from "@recruit/shared";
import { OwnerSideConfiguration } from "./owner-side.configuration";
import { ownerSideDatasource } from "./owner-side.datasource";
import fallbackTranslation from "./owner-side.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardSide.Configuration",
  type: "CONFIGURATION",
  value: OwnerSideConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.Owner.DashboardSide.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.Owner.DashboardSide.Datasource",
  type: "DATASOURCE",
  value: ownerSideDatasource,
};

export const OWNER_SIDE_COMPONENT: ComponentDefinition = {
  id: "Recruit.Owner.DashboardSide.Component",
  type: "COMPONENT",
  value: SideListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
