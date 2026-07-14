import type { LinkRendererConfig } from "@recruit/shared";

export interface JobDetailAttribute {
  label: string;
  path: string;
  /** Translation namespace to resolve the value through (e.g. "levels"). */
  translatePrefix?: string;
}

export interface JobDetailConfig {
  backLink: LinkRendererConfig;
  editRouteId: string;
  pipelineLink: LinkRendererConfig;
  attributes: JobDetailAttribute[];
  statusTones: Record<string, "success" | "warning" | "default">;
  keywords: {
    modalWidth: number;
    linkedinSearchUrl: string;
    copyResetMs: number;
  };
}

export const JobDetailConfiguration: JobDetailConfig = {
  backLink: { routeId: "Recruit.Jobs.Route" },
  editRouteId: "Recruit.AddJob.Route",
  pipelineLink: {
    id: "Recruit.JobDetail.Component",
    routeId: "Recruit.Candidates.Route",
    label: { name: "posting.viewPipeline" },
    sx: { fontSize: 12, fontWeight: 600 },
  },
  attributes: [
    { label: "attributes.level", path: "level", translatePrefix: "levels" },
    { label: "attributes.experience", path: "expYears" },
    { label: "attributes.empType", path: "empType" },
    { label: "attributes.workType", path: "workType" },
  ],
  statusTones: {
    Active: "success",
    Draft: "warning",
    Closed: "default",
  },
  keywords: {
    modalWidth: 560,
    linkedinSearchUrl:
      "https://www.linkedin.com/search/results/people/?keywords=",
    copyResetMs: 1800,
  },
};
