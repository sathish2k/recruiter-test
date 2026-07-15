import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const employeeFollowupsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/employee-dashboard/followups")).data,
});
