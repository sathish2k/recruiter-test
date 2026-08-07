import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const ownerActivityDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/activity-feed")).data,
});
