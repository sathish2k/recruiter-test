import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const permissionsDatasource = (): DatasourceInstance => ({
  // The full envelope — `meta.holders` feeds the role cards and members sheet.
  get: async () => (await httpClient.get("/permissions")).data,
  update: async (body?: Record<string, unknown>) =>
    (
      await httpClient.put(`/permissions/${String(body?.role)}`, {
        permissions: body?.permissions,
        scope: body?.scope,
      })
    ).data.data,
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/permissions/roles", body)).data.data,
  remove: async (body?: Record<string, unknown>) =>
    (
      await httpClient.delete(`/permissions/roles/${String(body?.role)}`, {
        data: { reassignTo: body?.reassignTo },
      })
    ).data.data,
});
