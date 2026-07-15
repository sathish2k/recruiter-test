import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const aiScreeningDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/screening")).data,
  update: async (body?: Record<string, unknown>) =>
    (await httpClient.put("/screening/settings", body ?? {})).data,
});
