import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const candidateDetailDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get(`/candidates/${query?.id ?? ""}`)).data,
});
