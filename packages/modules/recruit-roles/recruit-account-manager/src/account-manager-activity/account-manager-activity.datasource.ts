import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const accountmanagerActivityDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/activity-feed")).data,
});
