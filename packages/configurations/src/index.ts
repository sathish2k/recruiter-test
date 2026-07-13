import type { Configuration } from "@recruit/sdk";
import { layouts } from "./layouts";
import {
  AuthPages,
  CandidatePages,
  ClientPages,
  DashboardPages,
  JobsPages,
} from "./pages";

export { routes } from "./routes";
export { AllModules } from "./registry";

export const allConfigurations: Configuration[] = [
  ...layouts,
  ...Object.values(DashboardPages),
  ...Object.values(AuthPages),
  ...Object.values(ClientPages),
  ...Object.values(JobsPages),
  ...Object.values(CandidatePages),
];
