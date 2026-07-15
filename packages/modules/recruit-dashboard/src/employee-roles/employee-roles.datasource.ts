import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const employeeRolesDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/employee-dashboard/roles")).data,
});
