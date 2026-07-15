import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const employeeInvitesChartDatasource = (): DatasourceInstance => ({
  get: async () =>
    (await httpClient.get("/employee-dashboard/invites-week")).data,
});
