import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const candidatesDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/candidates", { params: query })).data,
  /** §6.1 — archive, never delete. The record stays, hidden from lists. */
  archive: async (id?: string) => (await httpClient.post(`/candidates/${String(id)}/archive`)).data,
});
