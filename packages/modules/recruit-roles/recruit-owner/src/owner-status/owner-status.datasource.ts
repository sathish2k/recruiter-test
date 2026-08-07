import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const ownerStatusDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/status")).data,
});
