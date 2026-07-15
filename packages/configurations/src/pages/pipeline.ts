import type { Configuration } from "@recruit/sdk";

export const PipelinePages: Record<string, Configuration> = {
  "Recruit.Pipeline.Page": {
    id: "Recruit.Pipeline.Page",
    elements: [
      {
        id: "pipeline",
        type: "component",
        componentType: "Recruit.Pipeline.Component",
      },
    ],
  },
};
