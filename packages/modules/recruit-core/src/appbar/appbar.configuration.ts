import type { AppbarConfig } from "./appbar.types";

// Icons and labels resolve in the component; see appbar.types.ts for the shape.
export const AppbarConfiguration: AppbarConfig = {
  titles: {
    "Recruit.Root": "titles.dashboard",
    "Recruit.Clients.Route": "titles.clients",
    "Recruit.ClientNew.Route": "titles.clientNew",
    "Recruit.ClientEdit.Route": "titles.clientEdit",
    "Recruit.ClientDetail.Route": "titles.clientDetail",
    "Recruit.Contacts.Route": "titles.contacts",
    "Recruit.ContactNew.Route": "titles.contactNew",
    "Recruit.ContactEdit.Route": "titles.contactEdit",
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
  },
  back: {
    "Recruit.CandidateNew.Route": {
      routeId: "Recruit.Candidates.Route",
      label: { name: "back.candidates" },
    },
    "Recruit.CandidateEdit.Route": {
      routeId: "Recruit.Candidates.Route",
      label: { name: "back.candidates" },
    },
    "Recruit.JobNew.Route": {
      routeId: "Recruit.Jobs.Route",
      label: { name: "back.jobs" },
    },
    "Recruit.JobEdit.Route": {
      routeId: "Recruit.Jobs.Route",
      label: { name: "back.jobs" },
    },
  },
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
  ],
};
