import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamLeadAiDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/ai-findings")).data,
});
