import type { Configuration } from "@recruit/sdk";

export const DashboardPages: Record<string, Configuration> = {
  "Recruit.Home.Page": {
    id: "Recruit.Home.Page",
    elements: [
      {
        id: "home-welcome",
        type: "component",
        componentType: "Recruit.Welcome.Component",
      },
    ],
  },
};
