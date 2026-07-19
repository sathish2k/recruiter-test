import type { Configuration } from "@recruit/sdk";

export const SupportPages: Record<string, Configuration> = {
  "Recruit.Notifications.Page": {
    id: "Recruit.Notifications.Page",
    elements: [
      {
        id: "notifications",
        type: "component",
        componentType: "Recruit.Notifications.Component",
        gridItem: { size: 12 },
        access: { resource: "candidates" },
      },
    ],
  },
  "Recruit.HelpCenter.Page": {
    id: "Recruit.HelpCenter.Page",
    elements: [
      {
        id: "help-center",
        type: "component",
        componentType: "Recruit.HelpCenter.Component",
        gridItem: { size: 12 },
      },
    ],
  },
};
