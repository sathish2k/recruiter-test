import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const adminTodayWorkDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/today-work")).data,
});
