import type { Module } from "@recruit/sdk";
import { SETTINGS_BILLING_COMPONENT } from "./billing/bootstrap";
import { EMAIL_TEMPLATES_COMPONENT } from "./email-templates/bootstrap";
import { SETTINGS_INTEGRATIONS_COMPONENT } from "./integrations/bootstrap";
import { SETTINGS_MEMBERS_COMPONENT } from "./members/bootstrap";
import { SETTINGS_SECURITY_COMPONENT } from "./security/bootstrap";
import { SETTINGS_TABS_COMPONENT } from "./settings-tabs/bootstrap";
import { SETTINGS_WORKSPACE_COMPONENT } from "./workspace/bootstrap";

export const SettingsModule: Module = {
  id: "Settings.Module",
  components: [
    SETTINGS_TABS_COMPONENT,
    SETTINGS_WORKSPACE_COMPONENT,
    SETTINGS_MEMBERS_COMPONENT,
    EMAIL_TEMPLATES_COMPONENT,
    SETTINGS_BILLING_COMPONENT,
    SETTINGS_INTEGRATIONS_COMPONENT,
    SETTINGS_SECURITY_COMPONENT,
  ],
};
