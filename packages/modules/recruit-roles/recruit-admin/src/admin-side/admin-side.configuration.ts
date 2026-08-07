import type { SideListRendererConfig } from "@recruit/shared";

export const AdminSideConfiguration: SideListRendererConfig = {
  title: "title",
  subtitle: "subtitle",
  badgeShape: "square",
  limit: 4,
  paths: {
    badge: "badge",
    title: "title",
    subtitle: "subtitle",
    value: "value",
    tone: "tone",
    meta: "meta",
    note: "note",
  },
  viewAll: {
    id: "Recruit.Admin.DashboardSide.Component",
    linkType: "route",
    routeId: "Recruit.SettingsAuditLog.Route",
    viewAllLabel: "viewAll",
    underline: "none",
  },
};
