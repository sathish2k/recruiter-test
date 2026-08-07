import type { QuickActionsRendererConfig } from "@recruit/shared";

/**
 * The action tiles the design draws for this role — they differ per seat, and
 * are not the same list filtered by permission. Each still carries the
 * capability its form needs, so a seat that loses one loses the tile too.
 *
 * Where the design points at a screen that does not exist yet (an interviews
 * calendar, an offer builder), the tile goes to the nearest screen that does.
 */
export const AccountManagerQuickActionsConfiguration: QuickActionsRendererConfig = {
  title: "title",
  actions: [
    {
      label: "addClient",
      icon: "domain-add",
      tone: "primary",
      link: {
        id: "Recruit.AccountManager.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.ClientNew.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "clients", action: ["create"] },
    },
    {
      label: "clientReport",
      icon: "summarize",
      tone: "violet",
      link: {
        id: "Recruit.AccountManager.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.EmailTemplates.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "templates", action: ["use"] },
    },
    {
      label: "renewalReview",
      icon: "event-repeat",
      tone: "warning",
      link: {
        id: "Recruit.AccountManager.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.Clients.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "clients", action: ["read"] },
    },
    {
      label: "contacts",
      icon: "assignment-ind",
      tone: "success",
      link: {
        id: "Recruit.AccountManager.DashboardQuickActions.Component",
        linkType: "route",
        routeId: "Recruit.Contacts.Route",
        underline: "none",
        color: "inherit",
      },
      access: { resource: "contacts", action: ["read"] },
    },
  ],
};
