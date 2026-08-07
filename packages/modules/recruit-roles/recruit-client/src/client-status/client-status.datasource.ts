import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientStatusDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/status")).data,
});
