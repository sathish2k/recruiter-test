import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

/** The four progress tiles. */
export const jobDetailStatsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return {};
    const response = await httpClient.get(`/jobs/${id}/kpis`);
    return ((response.data as Envelope)?.data as Record<string, unknown>) ?? {};
  },
});
