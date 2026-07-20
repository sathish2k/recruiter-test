import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const forgotPasswordDatasource = (): DatasourceInstance => ({
  create: async (values: unknown) => (await httpClient.post("/auth/forgot-password", values)).data,
});
