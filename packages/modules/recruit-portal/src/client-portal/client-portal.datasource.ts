import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientPortalDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get(`/client-portal/${query?.token ?? ""}`)).data,
  decide: async (token?: string, body?: Record<string, unknown>) =>
    (await httpClient.post(`/client-portal/${token}/decide`, body)).data,
});
