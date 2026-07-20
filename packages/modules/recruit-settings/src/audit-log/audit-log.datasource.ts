import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const auditLogDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/audit-log", { params: query })).data,
});
