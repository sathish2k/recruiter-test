import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamLeadStatusDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/status")).data,
});
