import type { AccessRule, Configuration } from "@recruit/sdk";

const SCREENING_ACCESS: AccessRule = { resource: "candidates" };
const AUTOMATION_ACCESS: AccessRule = { resource: "settings" };

export const AiPages: Record<string, Configuration> = {
  "Recruit.AiScreening.Page": {
    id: "Recruit.AiScreening.Page",
    elements: [
      {
        id: "ai-screening",
        type: "component",
        componentType: "Recruit.AiScreening.Component",
        gridItem: { size: 12 },
        access: SCREENING_ACCESS,
      },
    ],
  },
  "Recruit.Automation.Page": {
    id: "Recruit.Automation.Page",
    elements: [
      {
        id: "automation",
        type: "component",
        componentType: "Recruit.Automation.Component",
        gridItem: { size: 12 },
        access: AUTOMATION_ACCESS,
      },
    ],
  },
};
