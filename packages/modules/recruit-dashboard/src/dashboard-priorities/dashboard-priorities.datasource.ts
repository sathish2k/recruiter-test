import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardPrioritiesDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/priorities")).data,
});
