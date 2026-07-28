import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

/** One endpoint; the active tab travels as a filter. */
export const candidateDetailWorkspaceDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return [];
    const response = await httpClient.get(`/candidates/${id}/workspace`, {
      params: { tab: query?.tab ? String(query.tab) : "applications" },
    });
    return ((response.data as Envelope)?.data as unknown[]) ?? [];
  },
});
