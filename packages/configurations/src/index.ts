import type { Configuration } from "@recruit/sdk";
import { layouts } from "./layouts";
import {
  AiPages,
  AuthPages,
  CandidatePages,
  ClientPages,
  CorePages,
  DashboardPages,
  JobsPages,
  OpsPages,
  PipelinePages,
  PortalPages,
  SettingsPages,
  SupportPages,
} from "./pages";

export { ROLE_PERMISSIONS, type Resource } from "./access";
export { routes } from "./routes";
export { AllModules } from "./registry";

export const allConfigurations: Configuration[] = [
  ...layouts,
  ...Object.values(AiPages),
  ...Object.values(DashboardPages),
  ...Object.values(AuthPages),
  ...Object.values(ClientPages),
  ...Object.values(JobsPages),
  ...Object.values(OpsPages),
  ...Object.values(PipelinePages),
  ...Object.values(PortalPages),
  ...Object.values(CandidatePages),
  ...Object.values(CorePages),
  ...Object.values(SettingsPages),
  ...Object.values(SupportPages),
];
