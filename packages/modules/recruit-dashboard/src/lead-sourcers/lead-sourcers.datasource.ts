import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const leadSourcersDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/lead-dashboard/sourcers")).data,
});
