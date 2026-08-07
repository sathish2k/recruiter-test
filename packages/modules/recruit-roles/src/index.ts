import type { Module } from "@recruit/sdk";
import { AccountManagerDashboardModule } from "../recruit-account-manager/src/index";
import { AdminDashboardModule } from "../recruit-admin/src/index";
import { ClientDashboardModule } from "../recruit-client/src/index";
import { HiringManagerDashboardModule } from "../recruit-hiring-manager/src/index";
import { OwnerDashboardModule } from "../recruit-owner/src/index";
import { RecruiterDashboardModule } from "../recruit-recruiter/src/index";
import { SourcerDashboardModule } from "../recruit-sourcer/src/index";
import { TeamLeadDashboardModule } from "../recruit-team-lead/src/index";

/**
 * Every role's dashboard, in one place. Each nested package mirrors the
 * component set in `@recruit/module-dashboard` and overrides only its own
 * configuration, translation and datasource — the renderers are shared.
 */
export const RoleDashboardModules: Module[] = [
  OwnerDashboardModule,
  AdminDashboardModule,
  AccountManagerDashboardModule,
  TeamLeadDashboardModule,
  RecruiterDashboardModule,
  SourcerDashboardModule,
  HiringManagerDashboardModule,
  ClientDashboardModule,
];

export { AccountManagerDashboardModule } from "../recruit-account-manager/src/index";
export { AdminDashboardModule } from "../recruit-admin/src/index";
export { ClientDashboardModule } from "../recruit-client/src/index";
export { HiringManagerDashboardModule } from "../recruit-hiring-manager/src/index";
export { OwnerDashboardModule } from "../recruit-owner/src/index";
export { RecruiterDashboardModule } from "../recruit-recruiter/src/index";
export { SourcerDashboardModule } from "../recruit-sourcer/src/index";
export { TeamLeadDashboardModule } from "../recruit-team-lead/src/index";
