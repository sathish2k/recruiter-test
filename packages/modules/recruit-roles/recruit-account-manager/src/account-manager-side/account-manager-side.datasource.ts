import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const accountManagerSideDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/top-clients")).data,
});
