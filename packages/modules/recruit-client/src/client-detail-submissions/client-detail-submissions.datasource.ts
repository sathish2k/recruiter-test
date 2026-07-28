import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

/** Submitted CVs waiting on the client. */
export const clientDetailSubmissionsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return [];
    const response = await httpClient.get(`/clients/${id}/submissions`);
    return (response.data as Envelope)?.data ?? [];
  },
});
