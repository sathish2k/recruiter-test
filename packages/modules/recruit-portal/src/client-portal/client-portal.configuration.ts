import type { LinkRendererConfig } from "@recruit/shared";

export interface ClientPortalConfig {
  loginLink: LinkRendererConfig;
  agencyViewLink: LinkRendererConfig;
}

export const ClientPortalConfiguration: ClientPortalConfig = {
  loginLink: {
    routeId: "Recruit.ClientPortalLogin.Route",
    label: { name: "topbar.magicLink" },
  },
  agencyViewLink: {
    routeId: "Recruit.ClientDetail.Route",
    label: { name: "topbar.agencyView" },
    params: { id: { type: "dynamic", path: "clientId" } },
  },
};
