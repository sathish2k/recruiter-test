import type { TabNavConfiguration } from "@recruit/shared";

export const ProfileTabsConfiguration: TabNavConfiguration = {
  title: "title",
  subtitle: "subtitle",
  subtitleLink: { text: "subtitleLink", routeId: "Recruit.Settings.Route" },
  tabs: [
    { label: "tabs.profile", routeId: "Recruit.Profile.Route" },
    { label: "tabs.notifications", routeId: "Recruit.ProfileNotifications.Route" },
    { label: "tabs.security", routeId: "Recruit.ProfileSecurity.Route" },
    { label: "tabs.calendar", routeId: "Recruit.ProfileCalendar.Route" },
    { label: "tabs.appearance", routeId: "Recruit.ProfileAppearance.Route" },
    { label: "tabs.language", routeId: "Recruit.ProfileLanguage.Route" },
  ],
};
