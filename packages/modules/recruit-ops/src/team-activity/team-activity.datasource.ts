import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamActivityDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/team-activity", { params: query })).data,
});
