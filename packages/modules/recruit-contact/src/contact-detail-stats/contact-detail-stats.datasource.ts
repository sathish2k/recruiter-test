import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

/** The three KPI tiles. */
export const contactDetailStatsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return {};
    const response = await httpClient.get(`/contacts/${id}/kpis`);
    const data = ((response.data as Envelope)?.data as Record<string, unknown>) ?? {};
    // The tile prints a duration, not a bare count.
    return { ...data, avgReplyLabel: data.avgReplyHours ? `${data.avgReplyHours}h` : "—" };
  },
});
