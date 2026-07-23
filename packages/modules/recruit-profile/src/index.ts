import type { Module } from "@recruit/sdk";
import { PROFILE_APPEARANCE_COMPONENT } from "./appearance/bootstrap";
import { PROFILE_CALENDAR_COMPONENT } from "./calendar/bootstrap";
import { PROFILE_LANGUAGE_COMPONENT } from "./language/bootstrap";
import { PROFILE_NOTIFICATIONS_COMPONENT } from "./notifications/bootstrap";
import { PROFILE_FORM_COMPONENT } from "./profile-form/bootstrap";
import { PROFILE_TABS_COMPONENT } from "./profile-tabs/bootstrap";

export const ProfileModule: Module = {
  id: "Profile.Module",
  components: [
    PROFILE_TABS_COMPONENT,
    PROFILE_FORM_COMPONENT,
    PROFILE_NOTIFICATIONS_COMPONENT,
    PROFILE_CALENDAR_COMPONENT,
    PROFILE_APPEARANCE_COMPONENT,
    PROFILE_LANGUAGE_COMPONENT,
  ],
};
