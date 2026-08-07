import type { Module } from "@recruit/sdk";
import { SETTINGS_AUDIT_LOG_COMPONENT } from "./audit-log/bootstrap";
import { SETTINGS_BILLING_COMPONENT } from "./billing/bootstrap";
import { EMAIL_TEMPLATES_COMPONENT } from "./email-templates/bootstrap";
import { SETTINGS_INTEGRATIONS_COMPONENT } from "./integrations/bootstrap";
import { SETTINGS_INVITATIONS_COMPONENT } from "./invitations/bootstrap";
import { SETTINGS_MEMBERS_COMPONENT } from "./members/bootstrap";
import { PERMISSIONS_COMPONENT } from "./permissions/bootstrap";
import { ROLES_SUMMARY_COMPONENT } from "./roles-summary/bootstrap";
import { SETTINGS_SECURITY_COMPONENT } from "./security/bootstrap";
import { SETTINGS_SEARCH_COMPONENT } from "./settings-search/bootstrap";
import { SETTINGS_TABS_COMPONENT } from "./settings-tabs/bootstrap";
import {
  SETTINGS_BRANDING_COMPONENT,
  SETTINGS_EMAIL_COMPONENT,
  SETTINGS_GENERAL_COMPONENT,
  SETTINGS_LOCALIZATION_COMPONENT,
} from "./workspace/bootstrap";

export const SettingsModule: Module = {
  id: "Settings.Module",
  components: [
    SETTINGS_TABS_COMPONENT,
    SETTINGS_SEARCH_COMPONENT,
    SETTINGS_GENERAL_COMPONENT,
    SETTINGS_BRANDING_COMPONENT,
    SETTINGS_LOCALIZATION_COMPONENT,
    SETTINGS_EMAIL_COMPONENT,
    SETTINGS_MEMBERS_COMPONENT,
    SETTINGS_INVITATIONS_COMPONENT,
    PERMISSIONS_COMPONENT,
    ROLES_SUMMARY_COMPONENT,
    EMAIL_TEMPLATES_COMPONENT,
    SETTINGS_BILLING_COMPONENT,
    SETTINGS_INTEGRATIONS_COMPONENT,
    SETTINGS_SECURITY_COMPONENT,
    SETTINGS_AUDIT_LOG_COMPONENT,
  ],
};
