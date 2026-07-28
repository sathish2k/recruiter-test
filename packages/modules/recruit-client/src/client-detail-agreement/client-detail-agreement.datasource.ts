import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

/** The client summary — shared with the header; this card reads the terms off it. */
export const clientDetailAgreementDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return {};
    const response = await httpClient.get(`/clients/${id}/summary`);
    return ((response.data as Envelope)?.data as Record<string, unknown>) ?? {};
  },
});
