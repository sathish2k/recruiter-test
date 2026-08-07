import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const accountManagerQueueDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/queue")).data,
});
