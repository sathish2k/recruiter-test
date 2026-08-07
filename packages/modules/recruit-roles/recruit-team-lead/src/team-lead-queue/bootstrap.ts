import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { QueueCardRenderer } from "@recruit/shared";
import { TeamLeadQueueConfiguration } from "./team-lead-queue.configuration";
import { teamLeadQueueDatasource } from "./team-lead-queue.datasource";
import fallbackTranslation from "./team-lead-queue.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardQueue.Configuration",
  type: "CONFIGURATION",
  value: TeamLeadQueueConfiguration,
};
const TRANSLATION: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardQueue.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.TeamLead.DashboardQueue.Datasource",
  type: "DATASOURCE",
  value: teamLeadQueueDatasource,
};

export const TEAM_LEAD_QUEUE_COMPONENT: ComponentDefinition = {
  id: "Recruit.TeamLead.DashboardQueue.Component",
  type: "COMPONENT",
  value: QueueCardRenderer,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
