import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const jobsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/jobs", { params: query })).data,
  remove: async (id?: string) => (await httpClient.delete(`/jobs/${String(id)}`)).data,
});
