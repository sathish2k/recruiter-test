import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamLeadTodayWorkDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/today-work")).data,
});
