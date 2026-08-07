import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const accountManagerStatusDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/status")).data,
});
