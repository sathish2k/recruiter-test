import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const ownerSideDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/top-clients")).data,
});
