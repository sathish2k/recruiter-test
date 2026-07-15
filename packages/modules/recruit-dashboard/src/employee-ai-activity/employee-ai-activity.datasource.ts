import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const employeeAiActivityDatasource = (): DatasourceInstance => ({
  get: async () =>
    (await httpClient.get("/employee-dashboard/ai-activity")).data,
});
