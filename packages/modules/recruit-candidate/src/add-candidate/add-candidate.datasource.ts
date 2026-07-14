import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const addCandidateDatasource = (): DatasourceInstance => ({
  get: async () => ({}),
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/candidates", body)).data,
});
