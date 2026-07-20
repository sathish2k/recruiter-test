import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const organizationDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/organization")).data,
  update: async (body?: Record<string, unknown>) =>
    (await httpClient.put("/organization", body)).data,
});
