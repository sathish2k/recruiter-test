import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const leadInterviewsTodayDatasource = (): DatasourceInstance => ({
  get: async () =>
    (await httpClient.get("/lead-dashboard/interviews-today")).data,
});
