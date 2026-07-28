import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

/** One tab of the workspace panel. `tab` travels as a filter, so switching
 * tabs re-queries rather than loading every list up front. */
export const clientDetailWorkspaceDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return [];
    const response = await httpClient.get(`/clients/${id}/workspace`, {
      params: { tab: String(query?.tab ?? "roles") },
    });
    return (response.data as Envelope)?.data ?? [];
  },
});
