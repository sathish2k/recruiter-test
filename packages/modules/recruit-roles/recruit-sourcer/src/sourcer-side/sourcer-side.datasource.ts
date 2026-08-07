import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const sourcerSideDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/assigned-jobs")).data,
});
