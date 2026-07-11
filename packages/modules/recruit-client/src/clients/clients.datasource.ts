import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/clients", { params: query })).data,
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/clients", body)).data,
});
