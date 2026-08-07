import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const adminKpisDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/kpis")).data,
});
