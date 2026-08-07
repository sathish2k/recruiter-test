import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const adminSideDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/security-events")).data,
});
