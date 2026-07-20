import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const integrationsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/integrations")).data,
  connect: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/integrations", body)).data,
  reconnect: async (provider?: string) =>
    (await httpClient.post(`/integrations/${String(provider)}/reconnect`)).data,
  disconnect: async (provider?: string) =>
    (await httpClient.delete(`/integrations/${String(provider)}`)).data,
});
