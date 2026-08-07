import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const sourcerSavedSearchesDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/assigned-jobs")).data,
});
