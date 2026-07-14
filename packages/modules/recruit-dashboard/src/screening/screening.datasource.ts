import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const screeningDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/dashboard/screening", { params: query })).data,
});
