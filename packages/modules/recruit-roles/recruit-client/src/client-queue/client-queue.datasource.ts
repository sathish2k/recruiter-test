import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientQueueDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/queue")).data,
});
