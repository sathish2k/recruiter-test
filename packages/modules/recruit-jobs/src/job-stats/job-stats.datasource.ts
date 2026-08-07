import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const jobStatsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/jobs/stats")).data,
});
