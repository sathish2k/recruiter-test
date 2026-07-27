import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardRecentCandidatesDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/recent-candidates")).data,
});
