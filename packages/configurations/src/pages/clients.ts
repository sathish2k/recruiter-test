import type { Configuration } from "@recruit/sdk";

export const ClientPages: Record<string, Configuration> = {
  "Recruit.Clients.Page": {
    id: "Recruit.Clients.Page",
    elements: [{ id: "clients", type: "component", componentType: "Recruit.Clients.Component" }],
  },
  "Recruit.ClientForm.Page": {
    id: "Recruit.ClientForm.Page",
    elements: [
      { id: "client-form", type: "component", componentType: "Recruit.ClientForm.Component" },
    ],
  },
  "Recruit.ClientDetail.Page": {
    id: "Recruit.ClientDetail.Page",
    elements: [
      { id: "client-detail", type: "component", componentType: "Recruit.ClientDetail.Component" },
    ],
  },
};
