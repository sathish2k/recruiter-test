import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientSideDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/open-roles")).data,
});
