import { type DatasourceInstance, httpClient } from "@recruit/sdk";

/** The record itself — the body sections are fields of the requirement. */
export const jobDetailContentDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    query?.id ? (await httpClient.get(`/jobs/${String(query.id)}`)).data : {},
});
