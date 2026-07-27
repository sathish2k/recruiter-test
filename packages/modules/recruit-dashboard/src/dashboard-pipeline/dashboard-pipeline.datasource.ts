import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardPipelineDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/pipeline")).data,
});
