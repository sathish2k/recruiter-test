import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const sourcerMyPipelineDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/my-pipeline")).data,
});
