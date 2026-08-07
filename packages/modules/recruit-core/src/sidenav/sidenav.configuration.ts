import type { AccessRule } from "@recruit/sdk";

export interface SidenavItem {
  label: string;
  icon: string;
  access?: AccessRule;
  routeId: string;
}

export interface SidenavGroup {
  title: string;
  /** Groups are presentation, so they gate on `dashboardVariant` rather than a
   * capability — the design gives three different RECRUITING groups to three
   * roles that hold overlapping permissions. Items still carry the resource
   * rule that decides whether a capability is really available. */
  access?: AccessRule;
  items: SidenavItem[];
}

export interface SidenavConfig {
  groups: SidenavGroup[];
}

/** Everyone holds `dashboard`, so this pairs with `attributes` to express a
 * presentation-only rule without inventing a resource. */
const forVariants = (...variants: string[]): AccessRule => ({
  resource: "dashboard",
  attributes: { dashboardVariant: variants },
});

// Nav structure. `title`/`label` are translation keys; `icon` maps to an MUI
// icon in the component; `routeId` navigates via usePortalRouter.
//
// Interviews, Offers and Placements are in the design's rail but have no screen
// yet, so they are held back rather than shipped as items that navigate
// nowhere. Add each one back here when its route lands.
const groups: SidenavGroup[] = [
  {
    title: "groups.main",
    items: [
      {
        label: "items.dashboard",
        access: { resource: "dashboard" },
        icon: "dashboard",
        routeId: "Recruit.Root",
      },
    ],
  },
  {
    // The full desk: owner, account manager, team lead and recruiter.
    title: "groups.recruiting",
    access: forVariants("owner", "accountManager", "profileLead", "recruiter", "generic"),
    items: [
      {
        label: "items.jobs",
        access: { resource: "jobs" },
        icon: "work",
        routeId: "Recruit.Jobs.Route",
      },
      {
        label: "items.candidates",
        access: { resource: "candidates" },
        icon: "group",
        routeId: "Recruit.Candidates.Route",
      },
      {
        label: "items.pipeline",
        access: { resource: "candidates" },
        icon: "kanban",
        routeId: "Recruit.CandidateBoard.Route",
      },
    ],
  },
  {
    // Top of the funnel only — a sourcer never reaches an offer.
    title: "groups.recruiting",
    access: forVariants("sourcer"),
    items: [
      {
        label: "items.jobs",
        access: { resource: "jobs" },
        icon: "work",
        routeId: "Recruit.Jobs.Route",
      },
      {
        label: "items.candidates",
        access: { resource: "candidates" },
        icon: "group",
        routeId: "Recruit.Candidates.Route",
      },
      {
        label: "items.pipeline",
        access: { resource: "candidates" },
        icon: "kanban",
        routeId: "Recruit.CandidateBoard.Route",
      },
    ],
  },
  {
    // The quality gate: what is waiting on a decision, not a pipeline to work.
    title: "groups.recruiting",
    access: forVariants("hiringManager", "client"),
    items: [
      {
        label: "items.jobs",
        access: { resource: "jobs" },
        icon: "work",
        routeId: "Recruit.Jobs.Route",
      },
      {
        label: "items.candidates",
        access: { resource: "candidates" },
        icon: "group",
        routeId: "Recruit.Candidates.Route",
      },
    ],
  },
  {
    title: "groups.crm",
    access: forVariants("owner", "admin", "accountManager", "profileLead", "generic"),
    items: [
      {
        label: "items.clients",
        access: { resource: "clients" },
        icon: "domain",
        routeId: "Recruit.Clients.Route",
      },
      {
        label: "items.contacts",
        access: { resource: "contacts" },
        icon: "contacts",
        routeId: "Recruit.Contacts.Route",
      },
    ],
  },
  {
    title: "groups.administration",
    access: forVariants("owner", "admin"),
    items: [
      {
        label: "items.userManagement",
        access: { resource: "members", action: ["manage"] },
        icon: "supervisor-account",
        routeId: "Recruit.SettingsMembers.Route",
      },
      {
        label: "items.rolesPermissions",
        access: { resource: "roles", action: ["manage"] },
        icon: "shield-person",
        routeId: "Recruit.SettingsRoles.Route",
      },
      {
        label: "items.settings",
        access: { resource: "settings" },
        icon: "settings",
        routeId: "Recruit.Settings.Route",
      },
    ],
  },
];

export const SidenavConfiguration: SidenavConfig = { groups };
