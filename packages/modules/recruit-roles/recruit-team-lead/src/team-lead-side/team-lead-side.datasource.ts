import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamLeadSideDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/team-performance")).data,
});
