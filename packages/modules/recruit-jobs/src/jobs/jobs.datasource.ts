import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const jobsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/jobs", { params: query })).data,
  /** §6.1 — archive, never delete. The record stays, hidden from lists. */
  archive: async (id?: string) => (await httpClient.post(`/jobs/${String(id)}/archive`)).data,
});
