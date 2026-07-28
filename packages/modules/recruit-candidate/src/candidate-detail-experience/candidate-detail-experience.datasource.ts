import { type DatasourceInstance, httpClient } from "@recruit/sdk";

/** The record itself — experience, education and skills are its own fields. */
export const candidateDetailExperienceDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    query?.id ? (await httpClient.get(`/candidates/${String(query.id)}`)).data : {},
});
