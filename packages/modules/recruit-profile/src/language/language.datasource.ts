import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const languageDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/profile")).data,
  update: async (body?: Record<string, unknown>) => (await httpClient.put("/profile", body)).data,
});
