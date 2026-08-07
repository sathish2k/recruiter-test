import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardEmptyWorkspaceDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/summary")).data,
});
