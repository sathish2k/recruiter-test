import type { LinkRendererConfig } from "@recruit/shared";

export interface EmployeeRolesConfig {
  viewAll: LinkRendererConfig;
}

export const EmployeeRolesConfiguration: EmployeeRolesConfig = {
  viewAll: {
    routeId: "Recruit.Jobs.Route",
  },
};
