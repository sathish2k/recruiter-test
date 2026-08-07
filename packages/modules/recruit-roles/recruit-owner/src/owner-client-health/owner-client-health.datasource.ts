import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const ownerClientHealthDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/client-health")).data,
});
