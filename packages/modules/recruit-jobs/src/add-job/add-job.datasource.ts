import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const addJobDatasource = (): DatasourceInstance => ({
  get: async () => ({}),
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/jobs", body)).data,
});
