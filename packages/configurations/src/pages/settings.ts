import type { Configuration } from "@recruit/sdk";

const tabsElement = {
  id: "settings-tabs",
  type: "component" as const,
  componentType: "Recruit.SettingsTabs.Component",
};

export const SettingsPages: Record<string, Configuration> = {
  "Recruit.Settings.Page": {
    id: "Recruit.Settings.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      tabsElement,
      {
        id: "settings-team",
        type: "component",
        componentType: "Recruit.Settings.Component",
      },
      {
        id: "settings-permissions",
        type: "component",
        componentType: "Recruit.Permissions.Component",
      },
    ],
  },
  "Recruit.Profile.Page": {
    id: "Recruit.Profile.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      tabsElement,
      {
        id: "settings-profile",
        type: "component",
        componentType: "Recruit.Profile.Component",
      },
    ],
  },
  "Recruit.EmailTemplates.Page": {
    id: "Recruit.EmailTemplates.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      tabsElement,
      {
        id: "settings-email-templates",
        type: "component",
        componentType: "Recruit.EmailTemplates.Component",
      },
    ],
  },
};
