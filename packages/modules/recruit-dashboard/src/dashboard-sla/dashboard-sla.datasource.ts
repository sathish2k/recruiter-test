import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardSlaDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/sla")).data,
});
