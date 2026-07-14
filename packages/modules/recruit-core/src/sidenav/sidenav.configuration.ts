export interface SidenavItem {
  label: string;
  icon: string;
  routeId: string;
}

export interface SidenavGroup {
  title: string;
  items: SidenavItem[];
}

// Nav structure. `title`/`label` are translation keys; `icon` maps to an MUI
// icon in the component; `routeId` navigates via usePortalRouter.
const groups: SidenavGroup[] = [
  {
    title: "groups.main",
    items: [
      { label: "items.dashboard", icon: "dashboard", routeId: "Recruit.Root" },
      {
        label: "items.clients",
        icon: "domain",
        routeId: "Recruit.Clients.Route",
      },
      { label: "items.jobs", icon: "work", routeId: "Recruit.Jobs.Route" },
      {
        label: "items.candidates",
        icon: "group",
        routeId: "Recruit.Candidates.Route",
      },
      {
        label: "items.pipeline",
        icon: "kanban",
        routeId: "Recruit.Pipeline.Route",
      },
      {
        label: "items.teamActivity",
        icon: "monitoring",
        routeId: "Recruit.TeamActivity.Route",
      },
      {
        label: "items.interviews",
        icon: "event",
        routeId: "Recruit.Interviews.Route",
      },
      {
        label: "items.placements",
        icon: "handshake",
        routeId: "Recruit.Placements.Route",
      },
      {
        label: "items.messages",
        icon: "mail-filled",
        routeId: "Recruit.Messages.Route",
      },
    ],
  },
  {
    title: "groups.aiFeatures",
    items: [
      {
        label: "items.aiScreening",
        icon: "aiScreening",
        routeId: "Recruit.AiScreening.Route",
      },
      {
        label: "items.automation",
        icon: "automation",
        routeId: "Recruit.Automation.Route",
      },
    ],
  },
  {
    title: "groups.tools",
    items: [
      {
        label: "items.settings",
        icon: "settings",
        routeId: "Recruit.Settings.Route",
      },
      {
        label: "items.helpCenter",
        icon: "help",
        routeId: "Recruit.HelpCenter.Route",
      },
    ],
  },
];

export const SidenavConfiguration = { groups };
