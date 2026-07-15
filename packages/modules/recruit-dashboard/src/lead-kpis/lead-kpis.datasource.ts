import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const leadKpisDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/lead-dashboard/kpis")).data,
});
