import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const employeeKpisDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/employee-dashboard/kpis")).data,
});
