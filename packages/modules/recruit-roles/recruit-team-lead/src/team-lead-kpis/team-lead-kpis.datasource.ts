import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamLeadKpisDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/kpis")).data,
});
