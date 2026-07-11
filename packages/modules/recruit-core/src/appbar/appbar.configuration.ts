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
  } as Record<string, string>,
  actions: [
    { icon: "notifications", badge: true },
    { icon: "mail", routeId: "Recruit.Messages.Route" },
    { kind: "avatar", label: "avatar", routeId: "Recruit.Profile.Route" },
  ] as AppbarAction[],
};
