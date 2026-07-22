import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const permissionsDatasource = (): DatasourceInstance => ({
  // The full envelope — `meta.holders` feeds the role cards.
  get: async () => (await httpClient.get("/permissions")).data,
  update: async (body?: Record<string, unknown>) =>
    (
      await httpClient.put(`/permissions/${String(body?.role)}`, {
        permissions: body?.permissions,
      })
    ).data.data,
});
