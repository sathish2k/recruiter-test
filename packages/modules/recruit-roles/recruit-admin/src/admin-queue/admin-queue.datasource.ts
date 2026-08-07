import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const adminQueueDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/queue")).data,
});
