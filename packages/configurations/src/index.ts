import type { Configuration } from "@recruit/sdk";
import { layouts } from "./layouts";
import {
  AuthPages,
  CandidatePages,
  ClientPages,
  CorePages,
  DashboardPages,
  JobsPages,
  SettingsPages,
} from "./pages";

export { ROLE_PERMISSIONS, type Resource } from "./access";
export { routes } from "./routes";
export { AllModules } from "./registry";

export const allConfigurations: Configuration[] = [
  ...layouts,
  ...Object.values(DashboardPages),
  ...Object.values(AuthPages),
  ...Object.values(ClientPages),
  ...Object.values(JobsPages),
  ...Object.values(CandidatePages),
  ...Object.values(CorePages),
  ...Object.values(SettingsPages),
];
