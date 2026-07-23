import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const contactsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/contacts", { params: query })).data,
  archive: async (id?: string) => (await httpClient.post(`/contacts/${String(id)}/archive`)).data,
  setPrimary: async (id?: string) =>
    (await httpClient.post(`/contacts/${String(id)}/primary`)).data,
  remove: async (id?: string) => (await httpClient.delete(`/contacts/${String(id)}`)).data,
});
