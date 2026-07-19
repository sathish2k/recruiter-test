import type { LinkRendererConfig } from "@recruit/shared";

export interface PortalLoginConfig {
  portalRouteId: string;
  teamLoginLink: LinkRendererConfig;
}

export const PortalLoginConfiguration: PortalLoginConfig = {
  portalRouteId: "Recruit.ClientPortal.Route",
  teamLoginLink: {
    routeId: "Auth.Login.Route",
    label: { name: "footer.teamSignIn" },
  },
};
