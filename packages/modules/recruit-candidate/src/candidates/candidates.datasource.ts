import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const candidatesDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/candidates", { params: query })).data,
  remove: async (id?: string) => (await httpClient.delete(`/candidates/${String(id)}`)).data,
});
