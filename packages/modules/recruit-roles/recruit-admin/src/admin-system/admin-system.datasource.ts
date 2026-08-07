import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const adminSystemDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/system-status")).data,
});
