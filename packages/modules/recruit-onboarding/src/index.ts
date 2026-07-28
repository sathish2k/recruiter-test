import type { Module } from "@recruit/sdk";
import { GET_STARTED_COMPONENT } from "./get-started/bootstrap";
import { SETUP_WIZARD_COMPONENT } from "./setup-wizard/bootstrap";

export const OnboardingModule: Module = {
  id: "Onboarding.Module",
  components: [GET_STARTED_COMPONENT, SETUP_WIZARD_COMPONENT],
};
