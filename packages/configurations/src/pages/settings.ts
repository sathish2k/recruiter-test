import type { Configuration } from "@recruit/sdk";

export const SettingsPages: Record<string, Configuration> = {
  "Recruit.Settings.Page": {
    id: "Recruit.Settings.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "settings-tabs",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-workspace",
        type: "component",
        componentType: "Recruit.SettingsWorkspace.Component",
      },
    ],
  },
  "Recruit.SettingsMembers.Page": {
    id: "Recruit.SettingsMembers.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "settings-tabs",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-members",
        type: "component",
        componentType: "Recruit.SettingsMembers.Component",
      },
      {
        id: "settings-invitations",
        type: "component",
        componentType: "Recruit.SettingsInvitations.Component",
      },
    ],
  },
  "Recruit.SettingsRoles.Page": {
    id: "Recruit.SettingsRoles.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "settings-tabs",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-permissions",
        type: "component",
        componentType: "Recruit.Permissions.Component",
      },
    ],
  },
  "Recruit.EmailTemplates.Page": {
    id: "Recruit.EmailTemplates.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "settings-tabs",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-email-templates",
        type: "component",
        componentType: "Recruit.EmailTemplates.Component",
      },
    ],
  },
  "Recruit.SettingsIntegrations.Page": {
    id: "Recruit.SettingsIntegrations.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "settings-tabs",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-integrations",
        type: "component",
        componentType: "Recruit.SettingsIntegrations.Component",
      },
    ],
  },
  "Recruit.SettingsBilling.Page": {
    id: "Recruit.SettingsBilling.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "settings-tabs",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-billing",
        type: "component",
        componentType: "Recruit.SettingsBilling.Component",
      },
    ],
  },
  "Recruit.SettingsSecurity.Page": {
    id: "Recruit.SettingsSecurity.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "settings-tabs",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-security",
        type: "component",
        componentType: "Recruit.SettingsSecurity.Component",
      },
    ],
  },
  "Recruit.SettingsAuditLog.Page": {
    id: "Recruit.SettingsAuditLog.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "settings-tabs",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-audit-log",
        type: "component",
        componentType: "Recruit.SettingsAuditLog.Component",
      },
    ],
  },
};
