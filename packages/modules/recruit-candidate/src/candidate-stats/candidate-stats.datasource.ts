import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const candidateStatsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/candidates/stats")).data,
});
