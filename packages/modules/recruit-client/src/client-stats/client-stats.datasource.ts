import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientStatsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/clients/stats")).data,
});
