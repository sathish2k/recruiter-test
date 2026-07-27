import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardActivityDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/dashboard/activity", { params: { days: query?.days ?? "14" } })).data,
});
