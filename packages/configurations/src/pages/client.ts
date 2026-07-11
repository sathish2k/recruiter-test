import type { Configuration } from "@recruit/sdk";

export const ClientPages: Record<string, Configuration> = {
  "Recruit.Clients.Page": {
    id: "Recruit.Clients.Page",
    elements: [
      {
        id: "clients",
        type: "component",
        componentType: "Recruit.Clients.Component",
      },
    ],
  },
};
