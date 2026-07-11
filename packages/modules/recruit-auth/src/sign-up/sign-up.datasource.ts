import { createApiClient, type DatasourceInstance } from "@recruit/sdk";

export const signUpDatasource = (): DatasourceInstance => {
  const client = createApiClient();
  return {
    create: async (values: unknown) =>
      (await client.post("/auth/register", values)).data,
  };
};
