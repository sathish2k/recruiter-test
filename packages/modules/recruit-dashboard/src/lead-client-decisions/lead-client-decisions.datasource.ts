import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const leadClientDecisionsDatasource = (): DatasourceInstance => ({
  get: async () =>
    (await httpClient.get("/lead-dashboard/client-decisions")).data,
});
