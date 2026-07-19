import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const cvReviewDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/cv-review/queue")).data,
  submit: async (candidateId: string, body: Record<string, unknown>) =>
    (await httpClient.patch(`/cv-review/${candidateId}`, body)).data,
});
