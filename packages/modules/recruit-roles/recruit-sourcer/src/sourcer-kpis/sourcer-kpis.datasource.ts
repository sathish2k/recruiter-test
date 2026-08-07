import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const sourcerKpisDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/kpis")).data,
});
