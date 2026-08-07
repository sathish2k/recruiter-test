import type { Configuration } from "@recruit/sdk";

/** Every settings tab is the same two-track shell: the vertical rail in the
 * fixed 212px track, and the tab's own column configuration beside it. The
 * screen title is carried by the appbar, not the nav. */
export const SettingsPages: Record<string, Configuration> = {
  "Recruit.Settings.Page": {
    id: "Recruit.Settings.Page",
    gridContainer: { templateColumns: "212px minmax(0,1fr)", spacing: 2.5 },
    elements: [
      {
        id: "settings-nav",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-general-column",
        type: "configuration",
        configurationId: "Recruit.SettingsGeneral.Column",
      },
    ],
  },
  "Recruit.SettingsGeneral.Column": {
    id: "Recruit.SettingsGeneral.Column",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "settings-search",
        type: "component",
        componentType: "Recruit.SettingsSearch.Component",
      },
      {
        id: "settings-general",
        type: "component",
        componentType: "Recruit.SettingsGeneral.Component",
      },
    ],
  },

  "Recruit.SettingsBranding.Page": {
    id: "Recruit.SettingsBranding.Page",
    gridContainer: { templateColumns: "212px minmax(0,1fr)", spacing: 2.5 },
    elements: [
      {
        id: "settings-nav",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-branding-column",
        type: "configuration",
        configurationId: "Recruit.SettingsBranding.Column",
      },
    ],
  },
  "Recruit.SettingsBranding.Column": {
    id: "Recruit.SettingsBranding.Column",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "settings-search",
        type: "component",
        componentType: "Recruit.SettingsSearch.Component",
      },
      {
        id: "settings-branding",
        type: "component",
        componentType: "Recruit.SettingsBranding.Component",
      },
    ],
  },

  "Recruit.SettingsLocalization.Page": {
    id: "Recruit.SettingsLocalization.Page",
    gridContainer: { templateColumns: "212px minmax(0,1fr)", spacing: 2.5 },
    elements: [
      {
        id: "settings-nav",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-localization-column",
        type: "configuration",
        configurationId: "Recruit.SettingsLocalization.Column",
      },
    ],
  },
  "Recruit.SettingsLocalization.Column": {
    id: "Recruit.SettingsLocalization.Column",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "settings-search",
        type: "component",
        componentType: "Recruit.SettingsSearch.Component",
      },
      {
        id: "settings-localization",
        type: "component",
        componentType: "Recruit.SettingsLocalization.Component",
      },
    ],
  },

  "Recruit.SettingsSecurity.Page": {
    id: "Recruit.SettingsSecurity.Page",
    gridContainer: { templateColumns: "212px minmax(0,1fr)", spacing: 2.5 },
    elements: [
      {
        id: "settings-nav",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-security-column",
        type: "configuration",
        configurationId: "Recruit.SettingsSecurity.Column",
      },
    ],
  },
  "Recruit.SettingsSecurity.Column": {
    id: "Recruit.SettingsSecurity.Column",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "settings-search",
        type: "component",
        componentType: "Recruit.SettingsSearch.Component",
      },
      {
        id: "settings-security",
        type: "component",
        componentType: "Recruit.SettingsSecurity.Component",
      },
    ],
  },

  // The design's Email tab: the addresses and signature this workspace sends
  // from, then the automated messages themselves.
  "Recruit.EmailTemplates.Page": {
    id: "Recruit.EmailTemplates.Page",
    gridContainer: { templateColumns: "212px minmax(0,1fr)", spacing: 2.5 },
    elements: [
      {
        id: "settings-nav",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-email-column",
        type: "configuration",
        configurationId: "Recruit.SettingsEmail.Column",
      },
    ],
  },
  "Recruit.SettingsEmail.Column": {
    id: "Recruit.SettingsEmail.Column",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "settings-search",
        type: "component",
        componentType: "Recruit.SettingsSearch.Component",
      },
      {
        id: "settings-email",
        type: "component",
        componentType: "Recruit.SettingsEmail.Component",
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
    gridContainer: { templateColumns: "212px minmax(0,1fr)", spacing: 2.5 },
    elements: [
      {
        id: "settings-nav",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-integrations-column",
        type: "configuration",
        configurationId: "Recruit.SettingsIntegrations.Column",
      },
    ],
  },
  "Recruit.SettingsIntegrations.Column": {
    id: "Recruit.SettingsIntegrations.Column",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "settings-search",
        type: "component",
        componentType: "Recruit.SettingsSearch.Component",
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
    gridContainer: { templateColumns: "212px minmax(0,1fr)", spacing: 2.5 },
    elements: [
      {
        id: "settings-nav",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-billing-column",
        type: "configuration",
        configurationId: "Recruit.SettingsBilling.Column",
      },
    ],
  },
  "Recruit.SettingsBilling.Column": {
    id: "Recruit.SettingsBilling.Column",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "settings-search",
        type: "component",
        componentType: "Recruit.SettingsSearch.Component",
      },
      {
        id: "settings-billing",
        type: "component",
        componentType: "Recruit.SettingsBilling.Component",
      },
    ],
  },

  "Recruit.SettingsAuditLog.Page": {
    id: "Recruit.SettingsAuditLog.Page",
    gridContainer: { templateColumns: "212px minmax(0,1fr)", spacing: 2.5 },
    elements: [
      {
        id: "settings-nav",
        type: "component",
        componentType: "Recruit.SettingsTabs.Component",
      },
      {
        id: "settings-audit-log-column",
        type: "configuration",
        configurationId: "Recruit.SettingsAuditLog.Column",
      },
    ],
  },
  "Recruit.SettingsAuditLog.Column": {
    id: "Recruit.SettingsAuditLog.Column",
    stackContainer: { spacing: 2 },
    elements: [
      {
        id: "settings-search",
        type: "component",
        componentType: "Recruit.SettingsSearch.Component",
      },
      {
        id: "settings-audit-log",
        type: "component",
        componentType: "Recruit.SettingsAuditLog.Component",
      },
    ],
  },

  // User management and Roles & permissions are their own administration
  // screens on the rail — they carry no settings nav of their own.
  "Recruit.SettingsMembers.Page": {
    id: "Recruit.SettingsMembers.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
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
      {
        id: "settings-roles-summary",
        type: "component",
        componentType: "Recruit.RolesSummary.Component",
        access: { resource: "roles" },
      },
    ],
  },
  "Recruit.SettingsRoles.Page": {
    id: "Recruit.SettingsRoles.Page",
    stackContainer: { spacing: 2.5 },
    elements: [
      {
        id: "settings-permissions",
        type: "component",
        componentType: "Recruit.Permissions.Component",
      },
    ],
  },
};
