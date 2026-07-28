import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

/** One endpoint for every tab — the active tab travels as `tab`, and the
 * activity chips as `activity`. */
export const contactDetailWorkspaceDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return [];
    const response = await httpClient.get(`/contacts/${id}/workspace`, {
      params: {
        tab: query?.tab ? String(query.tab) : "activity",
        ...(query?.activity ? { activity: String(query.activity) } : {}),
      },
    });
    return (response.data as Envelope)?.data ?? [];
  },
});
