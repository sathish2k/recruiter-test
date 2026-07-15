import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const interviewsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/interviews")).data,
});
