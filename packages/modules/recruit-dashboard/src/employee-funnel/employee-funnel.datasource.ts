import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const employeeFunnelDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/employee-dashboard/funnel")).data,
});
