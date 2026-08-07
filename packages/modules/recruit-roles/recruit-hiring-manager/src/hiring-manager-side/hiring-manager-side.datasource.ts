import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const hiringManagerSideDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/rejection-reasons")).data,
});
