import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const permissionsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/permissions")).data.data,
  update: async (body?: Record<string, unknown>) =>
    (
      await httpClient.put(`/permissions/${String(body?.role)}`, {
        permissions: body?.permissions,
      })
    ).data.data,
});
