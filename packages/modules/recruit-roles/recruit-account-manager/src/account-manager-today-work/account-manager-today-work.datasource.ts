import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const accountManagerTodayWorkDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/today-work")).data,
});
