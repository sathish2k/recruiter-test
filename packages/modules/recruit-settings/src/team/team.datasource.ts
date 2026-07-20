import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/users", { params: query })).data,
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/users/invite", body)).data,
  update: async (body?: Record<string, unknown>) =>
    (
      await httpClient.patch(`/users/${String(body?.id)}/role`, {
        role: body?.role,
      })
    ).data,
  deactivate: async (id?: string) =>
    (await httpClient.post(`/users/${String(id)}/deactivate`)).data,
});
