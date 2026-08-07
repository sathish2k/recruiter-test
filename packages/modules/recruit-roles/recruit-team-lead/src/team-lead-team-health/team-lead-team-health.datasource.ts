import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamLeadTeamHealthDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/team-health")).data,
});
