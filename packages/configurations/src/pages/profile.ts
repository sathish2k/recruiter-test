import type { Configuration } from "@recruit/sdk";

const tabs = {
  id: "profile-tabs",
  type: "component" as const,
  componentType: "Recruit.ProfileTabs.Component",
};

export const ProfilePages: Record<string, Configuration> = {
  "Recruit.Profile.Page": {
    id: "Recruit.Profile.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      tabs,
      { id: "profile-form", type: "component", componentType: "Recruit.ProfileForm.Component" },
    ],
  },
  "Recruit.ProfileNotifications.Page": {
    id: "Recruit.ProfileNotifications.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      tabs,
      {
        id: "profile-notifications",
        type: "component",
        componentType: "Recruit.ProfileNotifications.Component",
      },
    ],
  },
  "Recruit.ProfileSecurity.Page": {
    id: "Recruit.ProfileSecurity.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      tabs,
      {
        id: "profile-security",
        type: "component",
        componentType: "Recruit.SettingsSecurity.Component",
      },
    ],
  },
  "Recruit.ProfileCalendar.Page": {
    id: "Recruit.ProfileCalendar.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      tabs,
      {
        id: "profile-calendar",
        type: "component",
        componentType: "Recruit.ProfileCalendar.Component",
      },
    ],
  },
  "Recruit.ProfileAppearance.Page": {
    id: "Recruit.ProfileAppearance.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      tabs,
      {
        id: "profile-appearance",
        type: "component",
        componentType: "Recruit.ProfileAppearance.Component",
      },
    ],
  },
  "Recruit.ProfileLanguage.Page": {
    id: "Recruit.ProfileLanguage.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      tabs,
      {
        id: "profile-language",
        type: "component",
        componentType: "Recruit.ProfileLanguage.Component",
      },
    ],
  },
};
