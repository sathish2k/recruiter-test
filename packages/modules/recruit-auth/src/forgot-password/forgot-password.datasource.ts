import { httpClient, type DatasourceInstance } from "@recruit/sdk";

export const forgotPasswordDatasource = (): DatasourceInstance => ({
  create: async (values: unknown) =>
    (await httpClient.post("/auth/forgot-password", values)).data,
});
