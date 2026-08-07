import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const ownerTodayWorkDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/today-work")).data,
});
