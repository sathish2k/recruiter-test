import type { Module } from "@recruit/sdk";
import { EMAIL_TEMPLATES_COMPONENT } from "./email-templates/bootstrap";
import { PERMISSIONS_COMPONENT } from "./permissions/bootstrap";
import { PROFILE_COMPONENT } from "./profile/bootstrap";
import { SETTINGS_TABS_COMPONENT } from "./settings-tabs/bootstrap";
import { TEAM_COMPONENT } from "./team/bootstrap";

export const SettingsModule: Module = {
  id: "Settings.Module",
  components: [
    SETTINGS_TABS_COMPONENT,
    TEAM_COMPONENT,
    PERMISSIONS_COMPONENT,
    PROFILE_COMPONENT,
    EMAIL_TEMPLATES_COMPONENT,
  ],
};
