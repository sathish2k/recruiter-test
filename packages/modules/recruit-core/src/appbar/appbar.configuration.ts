import type { AccessRule } from "@recruit/sdk";

export interface AppbarMenuItem {
  label: string;
  icon?: string;
  routeId?: string;
  /** Built-in action key handled by the component (e.g. "logout"). */
  action?: "logout";
  danger?: boolean;
  /** Verified + stripped by the engine before render (e.g. gate Settings). */
  access?: AccessRule;
}

export interface AppbarAction {
  icon?: string;
  routeId?: string;
  badge?: boolean;
  kind?: "avatar";
  label?: string;
  /** When present on the avatar, clicking opens this dropdown menu. */
  menu?: AppbarMenuItem[];
}

// `titles` maps a routeId to the heading shown on the left (translation key);
// `actions` is the right-hand cluster. Icons/labels resolve in the component.
export const AppbarConfiguration = {
  titles: {
    "Recruit.Root": "titles.dashboard",
    "Recruit.Clients.Route": "titles.clients",
    "Recruit.Jobs.Route": "titles.jobs",
    "Recruit.Candidates.Route": "titles.candidates",
    "Recruit.Pipeline.Route": "titles.pipeline",
    "Recruit.TeamActivity.Route": "titles.teamActivity",
    "Recruit.Interviews.Route": "titles.interviews",
    "Recruit.Placements.Route": "titles.placements",
    "Recruit.AiScreening.Route": "titles.aiScreening",
    "Recruit.Automation.Route": "titles.automation",
    "Recruit.Settings.Route": "titles.settings",
    "Recruit.Profile.Route": "titles.profile",
    "Recruit.EmailTemplates.Route": "titles.templates",
  } as Record<string, string>,
  actions: [
    { icon: "notifications", badge: true },
    { icon: "mail-filled", routeId: "Recruit.Messages.Route" },
    {
      kind: "avatar",
      label: "avatar",
      menu: [
        {
          label: "menu.profile",
          icon: "person",
          routeId: "Recruit.Profile.Route",
        },
        {
          label: "menu.settings",
          icon: "settings",
          routeId: "Recruit.Settings.Route",
          access: { resource: "settings" },
        },
        {
          label: "menu.logout",
          icon: "logout",
          action: "logout",
          danger: true,
        },
      ],
    },
  ] as AppbarAction[],
};
