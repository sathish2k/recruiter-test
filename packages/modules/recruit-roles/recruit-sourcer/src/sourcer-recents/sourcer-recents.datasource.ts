import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const sourcerRecentsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/recent-candidates")).data,
});
