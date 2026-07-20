import type { Configuration } from "@recruit/sdk";

const tabsElement = {
  id: "settings-tabs",
  type: "component" as const,
  componentType: "Recruit.SettingsTabs.Component",
};

function settingsPage(pageId: string, elementId: string, componentType: string): Configuration {
  return {
    id: pageId,
    stackContainer: { spacing: 2.5 },
    elements: [tabsElement, { id: elementId, type: "component", componentType }],
  };
}

export const SettingsPages: Record<string, Configuration> = {
  "Recruit.Settings.Page": settingsPage(
    "Recruit.Settings.Page",
    "settings-workspace",
    "Recruit.SettingsWorkspace.Component",
  ),
  "Recruit.SettingsMembers.Page": settingsPage(
    "Recruit.SettingsMembers.Page",
    "settings-members",
    "Recruit.SettingsMembers.Component",
  ),
  "Recruit.EmailTemplates.Page": settingsPage(
    "Recruit.EmailTemplates.Page",
    "settings-email-templates",
    "Recruit.EmailTemplates.Component",
  ),
  "Recruit.SettingsBilling.Page": settingsPage(
    "Recruit.SettingsBilling.Page",
    "settings-billing",
    "Recruit.SettingsBilling.Component",
  ),
  "Recruit.SettingsIntegrations.Page": settingsPage(
    "Recruit.SettingsIntegrations.Page",
    "settings-integrations",
    "Recruit.SettingsIntegrations.Component",
  ),
  "Recruit.SettingsSecurity.Page": settingsPage(
    "Recruit.SettingsSecurity.Page",
    "settings-security",
    "Recruit.SettingsSecurity.Component",
  ),
};
