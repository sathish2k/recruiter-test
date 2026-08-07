import type { LinkRendererConfig } from "@recruit/shared";

export interface RolesSummaryConfig {
  /** Roles listed, in seniority order. Labels and detail come from the
   * translations under `roles.*` / `roleDetail.*`. */
  roles: string[];
  /** Where a row and the header action navigate. */
  rolesRouteId: string;
  /** Header action — the design's "Open roles & permissions". */
  action: LinkRendererConfig;
}

export const RolesSummaryConfiguration: RolesSummaryConfig = {
  roles: ["owner", "admin", "profileLead", "recruiter", "sourcer"],
  rolesRouteId: "Recruit.SettingsRoles.Route",
  action: { routeId: "Recruit.SettingsRoles.Route", text: "action" },
};
