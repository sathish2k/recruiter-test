import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const hiringManagerKpisDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/kpis")).data,
});
