import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientChartDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/revenue-by-quarter")).data,
});
