import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const hiringDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/dashboard/hiring", { params: query })).data,
});
