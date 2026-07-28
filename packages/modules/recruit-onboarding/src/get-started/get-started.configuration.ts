import type { LinkRendererConfig } from "@recruit/shared";

/**
 * One CTA target per checklist step, keyed by the step key the API returns.
 * `skip`, `setup` and `dashboard` are the three page-level links.
 */
const links: Record<string, LinkRendererConfig> = {
  client: { routeId: "Recruit.ClientNew.Route" },
  role: { routeId: "Recruit.JobNew.Route" },
  team: { routeId: "Recruit.SettingsMembers.Route" },
  extension: { routeId: "Recruit.SettingsIntegrations.Route" },
  calendar: { routeId: "Recruit.SettingsIntegrations.Route" },
  skip: { routeId: "Recruit.Root", underline: "none" },
  setup: { routeId: "Recruit.Setup.Route", underline: "none" },
  dashboard: { routeId: "Recruit.Root", underline: "none" },
};

export const GetStartedConfiguration = { links };
