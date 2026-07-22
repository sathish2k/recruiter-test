import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/users", { params: query })).data,
  /** Inviting is a bulk send — `{ emails: [...], role, clientAccess }`. */
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/invitations", body)).data,
  update: async (body?: Record<string, unknown>) =>
    (
      await httpClient.patch(`/users/${String(body?.id)}/role`, {
        role: body?.role,
      })
    ).data,
  deactivate: async (id?: string) =>
    (await httpClient.post(`/users/${String(id)}/deactivate`)).data,
  /** Reversible, unlike deactivate — the design's menu toggles it. */
  suspend: async (body?: { id: string; suspended: boolean }) =>
    (await httpClient.post(`/users/${String(body?.id)}/suspend`, { suspended: body?.suspended }))
      .data,
  remove: async (id?: string) => (await httpClient.delete(`/users/${String(id)}`)).data,
});
