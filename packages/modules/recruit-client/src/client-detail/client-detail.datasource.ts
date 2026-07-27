import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface ListResponse {
  data?: Record<string, unknown>[];
}

/**
 * One fetch for the whole screen: the client record plus the two lists the
 * detail view shows — its roles and its contacts. Joined here so the component
 * stays a single `useFetch`.
 */
export const clientDetailDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return {};

    const [client, roles, contacts] = await Promise.all([
      httpClient.get(`/clients/${id}`),
      httpClient.get("/jobs", { params: { clientId: id, pageSize: "50" } }),
      httpClient.get("/contacts", { params: { client: id, pageSize: "50" } }),
    ]);

    return {
      ...(client.data as Record<string, unknown>),
      roles: (roles.data as ListResponse)?.data ?? [],
      contacts: (contacts.data as ListResponse)?.data ?? [],
    };
  },
});
