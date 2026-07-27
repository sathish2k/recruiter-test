import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { TableRenderer } from "@recruit/shared";
import { DashboardRecentCandidatesConfiguration } from "./dashboard-recent-candidates.configuration";
import { dashboardRecentCandidatesDatasource } from "./dashboard-recent-candidates.datasource";
import fallbackTranslation from "./dashboard-recent-candidates.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.DashboardRecentCandidates.Configuration",
  type: "CONFIGURATION",
  value: DashboardRecentCandidatesConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.DashboardRecentCandidates.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.DashboardRecentCandidates.Datasource",
  type: "DATASOURCE",
  value: dashboardRecentCandidatesDatasource,
};

export const DASHBOARD_RECENT_CANDIDATES_COMPONENT: ComponentDefinition = {
  id: "Recruit.DashboardRecentCandidates.Component",
  type: "COMPONENT",
  value: TableRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
