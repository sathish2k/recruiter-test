import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const leadCvQueueDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/lead-dashboard/cv-queue")).data,
});
