import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const upcomingInterviewsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/dashboard/interviews", { params: query })).data,
});
