import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

export const candidateDetailHeaderDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return {};
    const response = await httpClient.get(`/candidates/${id}/summary`);
    return ((response.data as Envelope)?.data as Record<string, unknown>) ?? {};
  },
});
