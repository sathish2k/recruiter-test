import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamLeadCoachingDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/team-performance")).data,
});
