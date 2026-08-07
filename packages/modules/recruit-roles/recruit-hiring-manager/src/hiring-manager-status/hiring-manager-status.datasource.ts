import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const hiringManagerStatusDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/status")).data,
});
