import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const ownerKpisDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/kpis")).data,
});
