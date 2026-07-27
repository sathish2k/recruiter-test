import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const dashboardAiRecommendationDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/summary")).data,
});
