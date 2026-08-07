import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const recruiterStatusDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/status")).data,
});
