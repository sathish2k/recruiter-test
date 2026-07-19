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

export interface AppbarLanguage {
  code: string;
  /** Native label shown in the picker (not translated). */
  label: string;
}

export interface AppbarAction {
  icon?: string;
  routeId?: string;
  badge?: boolean;
  kind?: "avatar" | "theme" | "language";
  label?: string;
  /** When present on the avatar, clicking opens this dropdown menu. */
  menu?: AppbarMenuItem[];
  /** Languages offered by a `kind: "language"` picker. */
  languages?: AppbarLanguage[];
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
    "Recruit.Notifications.Route": "titles.notifications",
    "Recruit.HelpCenter.Route": "titles.helpCenter",
  } as Record<string, string>,
  actions: [
    { kind: "theme" },
    {
      kind: "language",
      languages: [
        { code: "en", label: "English" },
        { code: "hi", label: "हिन्दी" },
        { code: "de", label: "Deutsch" },
        { code: "es", label: "Español" },
      ],
    },
    {
      icon: "notifications",
      badge: true,
      routeId: "Recruit.Notifications.Route",
    },
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
