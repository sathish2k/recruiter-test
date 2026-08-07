import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const recruiterMyPipelineDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/my-pipeline")).data,
});
