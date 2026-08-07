import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const hiringManagerTodayWorkDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/today-work")).data,
});
