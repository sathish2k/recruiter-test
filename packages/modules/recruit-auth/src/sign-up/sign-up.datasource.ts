import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const signUpDatasource = (): DatasourceInstance => ({
  create: async (values: unknown) => (await httpClient.post("/auth/register", values)).data,
});
