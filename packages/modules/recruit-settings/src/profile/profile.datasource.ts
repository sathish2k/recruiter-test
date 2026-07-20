import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const profileDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/profile")).data,
  update: async (body?: Record<string, unknown>) => (await httpClient.put("/profile", body)).data,
  updatePassword: async (body?: Record<string, unknown>) =>
    (await httpClient.put("/profile/password", body)).data,
});
