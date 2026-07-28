import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { JobDetailTimelineComponent } from "./job-detail-timeline.component";
import { jobDetailTimelineDatasource } from "./job-detail-timeline.datasource";
import fallbackTranslation from "./job-detail-timeline.translations.json";

const TRANSLATION: ComponentDependency = {
  id: "Recruit.JobDetailTimeline.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};
const DATASOURCE: ComponentDependency = {
  id: "Recruit.JobDetailTimeline.Datasource",
  type: "DATASOURCE",
  value: jobDetailTimelineDatasource,
};

export const JOB_DETAIL_TIMELINE_COMPONENT: ComponentDefinition = {
  id: "Recruit.JobDetailTimeline.Component",
  type: "COMPONENT",
  value: JobDetailTimelineComponent,
  default: {
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
