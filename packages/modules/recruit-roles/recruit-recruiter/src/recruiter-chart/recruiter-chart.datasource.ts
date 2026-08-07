import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const recruiterChartDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/revenue-by-quarter")).data,
});
