import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/clients", { params: query })).data,
  remove: async (id?: string) => (await httpClient.delete(`/clients/${String(id)}`)).data,
  // The card's kebab archives — a client is hidden from lists but its history
  // (requirements, submissions, placements) is retained. Never hard-deleted.
  archive: async (id?: string) => (await httpClient.post(`/clients/${String(id)}/archive`)).data,
});
