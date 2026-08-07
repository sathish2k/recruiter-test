import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const sourcerQueueDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/queue")).data,
});
