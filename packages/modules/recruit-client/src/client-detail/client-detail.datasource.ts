import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const clientDetailDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get(`/clients/${query?.id ?? ""}`)).data,
  decide: async (
    clientId?: string,
    submissionId?: string,
    body?: Record<string, unknown>,
  ) =>
    (
      await httpClient.patch(
        `/clients/${clientId}/submissions/${submissionId}`,
        body,
      )
    ).data,
  update: async (clientId?: string, body?: Record<string, unknown>) =>
    (await httpClient.patch(`/clients/${clientId}`, body)).data,
  remove: async (clientId?: string) =>
    (await httpClient.delete(`/clients/${clientId}`)).data,
});
