import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const calendarDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/integrations")).data,
  connect: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/integrations", body)).data,
  disconnect: async (provider?: string) =>
    (await httpClient.delete(`/integrations/${String(provider)}`)).data,
});
