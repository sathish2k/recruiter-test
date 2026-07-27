import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardUpcomingDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/upcoming-interviews")).data,
});
