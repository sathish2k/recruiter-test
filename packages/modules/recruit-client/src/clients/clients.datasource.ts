import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/clients", { params: query })).data,
  remove: async (id?: string) => (await httpClient.delete(`/clients/${String(id)}`)).data,
});
