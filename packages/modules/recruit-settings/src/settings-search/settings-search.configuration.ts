import type { AccessRule } from "@recruit/sdk";

/** One searchable setting: where it lives, and what it is called. */
export interface SettingsSearchEntry {
  /** Translation key for the setting's name. */
  label: string;
  /** Translation key for the tab it sits on. */
  tab: string;
  /** ICON_REGISTRY name. */
  icon: string;
  routeId: string;
  access?: AccessRule;
}

export interface SettingsSearchConfig {
  placeholder: string;
  index: SettingsSearchEntry[];
}

export const SettingsSearchConfiguration: SettingsSearchConfig = {
  placeholder: "placeholder",
  index: [
    {
      label: "entries.agencyName",
      tab: "tabs.general",
      icon: "corporate-fare",
      routeId: "Recruit.Settings.Route",
    },
    {
      label: "entries.feeAgreement",
      tab: "tabs.general",
      icon: "request-quote",
      routeId: "Recruit.Settings.Route",
    },
    {
      label: "entries.identifiers",
      tab: "tabs.general",
      icon: "tune",
      routeId: "Recruit.Settings.Route",
    },
    {
      label: "entries.appLogo",
      tab: "tabs.branding",
      icon: "view",
      routeId: "Recruit.SettingsBranding.Route",
    },
    {
      label: "entries.brandColour",
      tab: "tabs.branding",
      icon: "palette",
      routeId: "Recruit.SettingsBranding.Route",
    },
    {
      label: "entries.language",
      tab: "tabs.localization",
      icon: "translate",
      routeId: "Recruit.SettingsLocalization.Route",
    },
    {
      label: "entries.currency",
      tab: "tabs.localization",
      icon: "payments",
      routeId: "Recruit.SettingsLocalization.Route",
    },
    {
      label: "entries.timezone",
      tab: "tabs.localization",
      icon: "schedule",
      routeId: "Recruit.SettingsLocalization.Route",
    },
    {
      label: "entries.dateFormat",
      tab: "tabs.localization",
      icon: "calendar_month",
      routeId: "Recruit.SettingsLocalization.Route",
    },
    {
      label: "entries.workingHours",
      tab: "tabs.localization",
      icon: "timer",
      routeId: "Recruit.SettingsLocalization.Route",
    },
    {
      label: "entries.loginActivity",
      tab: "tabs.security",
      icon: "login",
      routeId: "Recruit.SettingsSecurity.Route",
    },
    {
      label: "entries.sessions",
      tab: "tabs.security",
      icon: "devices",
      routeId: "Recruit.SettingsSecurity.Route",
    },
    {
      label: "entries.dangerZone",
      tab: "tabs.security",
      icon: "warning",
      routeId: "Recruit.SettingsSecurity.Route",
    },
    {
      label: "entries.organisationEmail",
      tab: "tabs.email",
      icon: "mail",
      routeId: "Recruit.EmailTemplates.Route",
    },
    {
      label: "entries.replyTo",
      tab: "tabs.email",
      icon: "forward-to-inbox",
      routeId: "Recruit.EmailTemplates.Route",
    },
    {
      label: "entries.signature",
      tab: "tabs.email",
      icon: "edit",
      routeId: "Recruit.EmailTemplates.Route",
    },
    {
      label: "entries.calendar",
      tab: "tabs.integrations",
      icon: "event",
      routeId: "Recruit.SettingsIntegrations.Route",
    },
    {
      label: "entries.resumeParser",
      tab: "tabs.integrations",
      icon: "description",
      routeId: "Recruit.SettingsIntegrations.Route",
    },
    {
      label: "entries.planAndSeats",
      tab: "tabs.billing",
      icon: "credit-card",
      routeId: "Recruit.SettingsBilling.Route",
    },
    {
      label: "entries.invoices",
      tab: "tabs.billing",
      icon: "article",
      routeId: "Recruit.SettingsBilling.Route",
    },
  ],
};
