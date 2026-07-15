import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const employeeGreetingDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/employee-dashboard/greeting")).data,
});
