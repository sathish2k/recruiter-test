import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

export const candidateDetailAssessmentDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return {};
    const response = await httpClient.get(`/candidates/${id}/assessment`);
    return ((response.data as Envelope)?.data as Record<string, unknown>) ?? {};
  },
});
