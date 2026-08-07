import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const ownerTeamDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/team-performance")).data,
});
