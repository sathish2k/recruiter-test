import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardDashboardQueueDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/queue")).data,
});
