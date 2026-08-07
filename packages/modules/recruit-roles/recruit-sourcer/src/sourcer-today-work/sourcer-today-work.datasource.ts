import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const sourcerTodayWorkDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/today-work")).data,
});
