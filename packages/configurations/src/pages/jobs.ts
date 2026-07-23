import type { Configuration } from "@recruit/sdk";

export const JobPages: Record<string, Configuration> = {
  "Recruit.Jobs.Page": {
    id: "Recruit.Jobs.Page",
    elements: [{ id: "jobs", type: "component", componentType: "Recruit.Jobs.Component" }],
  },
  "Recruit.JobForm.Page": {
    id: "Recruit.JobForm.Page",
    elements: [{ id: "job-form", type: "component", componentType: "Recruit.JobForm.Component" }],
  },
};
