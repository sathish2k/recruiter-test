import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardSummaryDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/summary")).data,
});
