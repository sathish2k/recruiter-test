import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const leadGreetingDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/lead-dashboard/greeting")).data,
});
