export interface AppbarAction {
  icon?: string;
  routeId?: string;
  badge?: boolean;
  kind?: "avatar";
  label?: string;
}

// `titles` maps a routeId to the heading shown on the left (translation key);
// `actions` is the right-hand cluster. Icons/labels resolve in the component.
export const AppbarConfiguration = {
  titles: {
    "Recruit.Root": "titles.dashboard",
    "Recruit.Clients.Route": "titles.clients",
    "Recruit.Jobs.Route": "titles.jobs",
    "Recruit.Candidates.Route": "titles.candidates",
  } as Record<string, string>,
  actions: [
    { icon: "notifications", badge: true },
    { icon: "mail-filled", routeId: "Recruit.Messages.Route" },
    { kind: "avatar", label: "avatar", routeId: "Recruit.Profile.Route" },
  ] as AppbarAction[],
};
