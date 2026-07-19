import type { Configuration } from "@recruit/sdk";

export const JobsPages: Record<string, Configuration> = {
  "Recruit.Jobs.Page": {
    id: "Recruit.Jobs.Page",
    elements: [
      {
        id: "jobs",
        type: "component",
        componentType: "Recruit.Jobs.Component",
      },
    ],
  },
  "Recruit.AddJob.Page": {
    id: "Recruit.AddJob.Page",
    elements: [
      {
        id: "add-job",
        type: "component",
        componentType: "Recruit.AddJob.Component",
      },
    ],
  },
  "Recruit.JobDetail.Page": {
    id: "Recruit.JobDetail.Page",
    elements: [
      {
        id: "job-detail",
        type: "component",
        componentType: "Recruit.JobDetail.Component",
      },
    ],
  },
  "Recruit.EditJob.Page": {
    id: "Recruit.EditJob.Page",
    elements: [
      {
        id: "edit-job",
        type: "component",
        componentType: "Recruit.EditJob.Component",
      },
    ],
  },
};
