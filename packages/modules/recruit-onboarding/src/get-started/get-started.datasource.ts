import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const getStartedDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/onboarding/checklist")).data,
});
