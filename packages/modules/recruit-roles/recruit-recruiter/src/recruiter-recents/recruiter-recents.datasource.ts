import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const recruiterRecentsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/recent-candidates")).data,
});
