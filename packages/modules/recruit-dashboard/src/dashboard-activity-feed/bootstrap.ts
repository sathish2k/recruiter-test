import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { ListRenderer } from "@recruit/shared";
import { DashboardActivityFeedConfiguration } from "./dashboard-activity-feed.configuration";
import { dashboardActivityFeedDatasource } from "./dashboard-activity-feed.datasource";
import fallbackTranslation from "./dashboard-activity-feed.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardActivityFeed.Configuration",
  type: "CONFIGURATION",
  value: DashboardActivityFeedConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardActivityFeed.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardActivityFeed.Datasource",
  type: "DATASOURCE",
  value: dashboardActivityFeedDatasource,
};

export const DASHBOARD_ACTIVITY_FEED_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardActivityFeed.Component",
  type: "COMPONENT",
  value: ListRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
