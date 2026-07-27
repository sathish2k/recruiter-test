import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SegmentedFilterRenderer } from "@recruit/shared";
import { DashboardRailFilterConfiguration } from "./dashboard-rail-filter.configuration";
import fallbackTranslation from "./dashboard-rail-filter.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardRailFilter.Configuration",
  type: "CONFIGURATION",
  value: DashboardRailFilterConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardRailFilter.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

export const DASHBOARD_RAIL_FILTER_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardRailFilter.Component",
  type: "COMPONENT",
  value: SegmentedFilterRenderer,
  default: { configuration: CONFIGURATION, translation: TRANSLATION },
};
