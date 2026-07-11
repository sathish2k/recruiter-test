import { httpClient, type DatasourceInstance } from "@recruit/sdk";

export const welcomeDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/home", { params: query })).data,
});
