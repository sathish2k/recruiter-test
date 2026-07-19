import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const editCandidateDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get(`/candidates/${query?.id ?? ""}`)).data,
  update: async (candidateId: string, body?: Record<string, unknown>) =>
    (await httpClient.patch(`/candidates/${candidateId}`, body)).data,
  remove: async (candidateId: string) =>
    (await httpClient.delete(`/candidates/${candidateId}`)).data,
});
