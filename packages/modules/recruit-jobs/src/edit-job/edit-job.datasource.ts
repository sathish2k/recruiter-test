import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const editJobDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get(`/jobs/${String(query?.id ?? "")}`)).data,
  update: async (jobId: string, body?: Record<string, unknown>) =>
    (await httpClient.patch(`/jobs/${jobId}`, body)).data,
  remove: async (jobId: string) =>
    (await httpClient.delete(`/jobs/${jobId}`)).data,
});
