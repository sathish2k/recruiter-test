import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const jobDetailDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get(`/jobs/${String(query?.id ?? "")}`)).data,
});
