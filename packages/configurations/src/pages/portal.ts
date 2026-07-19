import type { Configuration } from "@recruit/sdk";

export const PortalPages: Record<string, Configuration> = {
  "Recruit.ClientPortalLogin.Page": {
    id: "Recruit.ClientPortalLogin.Page",
    elements: [
      {
        id: "client-portal-login",
        type: "component",
        componentType: "Recruit.ClientPortalLogin.Component",
      },
    ],
  },
  "Recruit.ClientPortal.Page": {
    id: "Recruit.ClientPortal.Page",
    elements: [
      {
        id: "client-portal",
        type: "component",
        componentType: "Recruit.ClientPortal.Component",
      },
    ],
  },
};
