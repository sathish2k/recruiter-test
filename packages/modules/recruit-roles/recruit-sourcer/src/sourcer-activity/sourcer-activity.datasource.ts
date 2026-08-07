import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const sourcerActivityDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/activity-feed")).data,
});
