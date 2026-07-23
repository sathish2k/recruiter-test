import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientDetailDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    query?.id ? (await httpClient.get(`/clients/${String(query.id)}`)).data : {},
});
