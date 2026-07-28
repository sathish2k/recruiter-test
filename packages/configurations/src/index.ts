import type { Configuration } from "@recruit/sdk";
import { layouts } from "./layouts";
import {
  AuthPages,
  CandidatePages,
  ClientPages,
  ContactPages,
  CorePages,
  DashboardPages,
  JobPages,
  OnboardingPages,
  ProfilePages,
  SettingsPages,
} from "./pages";

export { type Resource, ROLE_PERMISSIONS } from "./access";
export { AllModules } from "./registry";
export { routes } from "./routes";

export const allConfigurations: Configuration[] = [
  ...layouts,
  ...Object.values(AuthPages),
  ...Object.values(CorePages),
  ...Object.values(DashboardPages),
  ...Object.values(OnboardingPages),
  ...Object.values(ProfilePages),
  ...Object.values(SettingsPages),
  ...Object.values(ContactPages),
  ...Object.values(ClientPages),
  ...Object.values(JobPages),
  ...Object.values(CandidatePages),
];
