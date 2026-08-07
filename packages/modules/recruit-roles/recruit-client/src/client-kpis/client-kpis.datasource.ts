import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientKpisDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/kpis")).data,
});
