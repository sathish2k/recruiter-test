import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const automationDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/automations")).data,
  update: async (body?: Record<string, unknown>) =>
    (
      await httpClient.patch(`/automations/${String(body?.id)}`, {
        enabled: body?.enabled,
      })
    ).data,
});
