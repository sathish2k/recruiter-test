import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

export const contactDetailClientDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return null;
    const response = await httpClient.get(`/contacts/${id}/client`);
    return (response.data as Envelope)?.data ?? null;
  },
});
