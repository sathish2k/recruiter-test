import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const adminStatusDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/status")).data,
});
