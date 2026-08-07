import type { QuickActionsRendererConfig } from "@recruit/shared";

/**
 * The action tiles the design draws for this role — they differ per seat, and
 * are not the same list filtered by permission. Each still carries the
 * capability its form needs, so a seat that loses one loses the tile too.
 *
 * Where the design points at a screen that does not exist yet (an interviews
 * calendar, an offer builder), the tile goes to the nearest screen that does.
 */
export const AdminQuickActionsConfiguration: QuickActionsRendererConfig = {
  title: "title",
  actions: [
    {
      label: "inviteMember",
      icon: "person-add",
      tone: "primary",
      link: {
        id: "Recruit.Admin.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.SettingsMembers.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "members", action: ["invite"] },
    },
    {
      label: "integrations",
      icon: "hub",
      tone: "info",
      link: {
        id: "Recruit.Admin.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.SettingsIntegrations.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "integrations", action: ["manage"] },
    },
    {
      label: "roles",
      icon: "shield-person",
      tone: "violet",
      link: {
        id: "Recruit.Admin.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.SettingsRoles.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "roles", action: ["manage"] },
    },
    {
      label: "auditLogs",
      icon: "receipt-long",
      tone: "success",
      link: {
        id: "Recruit.Admin.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.SettingsAuditLog.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "audit", action: ["view"] },
    },
  ],
  secondary: {
    label: "runningTheBusiness",
    actions: [
      {
        label: "securityPolicy",
        icon: "shield",
        link: {
          id: "Recruit.Admin.DashboardQuickActions.Component",
          linkType: "route",
          routeId: "Recruit.SettingsSecurity.Route",
          underline: "none",
          color: "inherit",
        },
        access: { resource: "security", action: ["manage"] },
      },
      {
        label: "billing",
        icon: "payments",
        link: {
          id: "Recruit.Admin.DashboardQuickActions.Component",
          linkType: "route",
          routeId: "Recruit.SettingsBilling.Route",
          underline: "none",
          color: "inherit",
        },
        access: { resource: "billing", action: ["view"] },
      },
    ],
  },
};
