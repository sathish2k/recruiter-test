import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const ownerQueueDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/queue")).data,
});
