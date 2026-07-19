import type { Module } from "@recruit/sdk";
import { HELP_CENTER_COMPONENT } from "./help-center/bootstrap";
import { NOTIFICATIONS_COMPONENT } from "./notifications/bootstrap";

export const SupportModule: Module = {
  id: "Support.Module",
  components: [NOTIFICATIONS_COMPONENT, HELP_CENTER_COMPONENT],
};
