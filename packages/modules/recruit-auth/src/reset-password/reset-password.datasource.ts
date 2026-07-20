import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const resetPasswordDatasource = (): DatasourceInstance => ({
  create: async (values: unknown) => (await httpClient.post("/auth/reset-password", values)).data,
});
