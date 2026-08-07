import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const recruiterKpisDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/kpis")).data,
});
