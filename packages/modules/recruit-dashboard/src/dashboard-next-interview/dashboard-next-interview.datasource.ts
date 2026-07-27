import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardNextInterviewDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/next-interview")).data,
});
