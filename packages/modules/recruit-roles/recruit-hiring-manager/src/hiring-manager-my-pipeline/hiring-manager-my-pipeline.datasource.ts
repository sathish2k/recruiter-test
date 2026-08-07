import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const hiringManagerMyPipelineDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/my-pipeline")).data,
});
