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
};
