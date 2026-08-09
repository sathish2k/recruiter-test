import type { Configuration } from "@recruit/sdk";

export const CorePages: Record<string, Configuration> = {
  "Recruit.Placeholder.Page": {
    id: "Recruit.Placeholder.Page",
    elements: [
      {
        id: "core-placeholder",
        type: "component",
        componentType: "Core.Placeholder.Component",
      },
    ],
  },
};
