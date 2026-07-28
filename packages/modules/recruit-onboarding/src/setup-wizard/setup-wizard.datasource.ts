import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const setupWizardDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/onboarding/setup")).data,
  // Each step autosaves its own slice, so an update is always a partial patch.
  update: async (values: unknown) => (await httpClient.put("/onboarding/setup", values)).data,
});
