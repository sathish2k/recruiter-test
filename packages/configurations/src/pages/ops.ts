import type { AccessRule, Configuration } from "@recruit/sdk";

const OPS_ACCESS: AccessRule = { resource: "candidates" };

export const OpsPages: Record<string, Configuration> = {
  "Recruit.TeamActivity.Page": {
    id: "Recruit.TeamActivity.Page",
    elements: [
      {
        id: "team-activity",
        type: "component",
        componentType: "Recruit.TeamActivity.Component",
        gridItem: { size: 12 },
        access: OPS_ACCESS,
      },
    ],
  },
  "Recruit.Interviews.Page": {
    id: "Recruit.Interviews.Page",
    elements: [
      {
        id: "interviews",
        type: "component",
        componentType: "Recruit.Interviews.Component",
        gridItem: { size: 12 },
        access: OPS_ACCESS,
      },
    ],
  },
  "Recruit.Placements.Page": {
    id: "Recruit.Placements.Page",
    elements: [
      {
        id: "placements",
        type: "component",
        componentType: "Recruit.Placements.Component",
        gridItem: { size: 12 },
        access: OPS_ACCESS,
      },
    ],
  },
};
