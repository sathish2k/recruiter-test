import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const accountManagerChartDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/revenue-by-quarter")).data,
});
