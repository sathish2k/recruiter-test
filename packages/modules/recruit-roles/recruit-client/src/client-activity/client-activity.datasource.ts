import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientActivityDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/activity-feed")).data,
});
