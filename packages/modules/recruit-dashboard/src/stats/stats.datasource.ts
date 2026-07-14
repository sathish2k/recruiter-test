import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const statsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/dashboard/stats", { params: query })).data,
});
