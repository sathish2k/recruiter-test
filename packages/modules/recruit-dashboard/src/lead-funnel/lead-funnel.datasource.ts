import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const leadFunnelDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/lead-dashboard/funnel")).data,
});
