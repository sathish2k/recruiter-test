import { createApiClient, type DatasourceInstance } from "@recruit/sdk";

export const welcomeDatasource = (): DatasourceInstance => {
  const client = createApiClient();
  return {
    get: async (query?: Record<string, unknown>) =>
      (await client.get("/home", { params: query })).data,
  };
};
