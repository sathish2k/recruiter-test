import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

export const contactDetailInfoDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return null;
    const response = await httpClient.get(`/contacts/${id}/info`);
    return (response.data as Envelope)?.data ?? null;
  },
});
