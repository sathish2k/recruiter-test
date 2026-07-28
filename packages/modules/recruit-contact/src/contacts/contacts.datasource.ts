import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const contactsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/contacts", { params: query })).data,
  archive: async (id?: string) => (await httpClient.post(`/contacts/${String(id)}/archive`)).data,
  setPrimary: async (id?: string) =>
    (await httpClient.post(`/contacts/${String(id)}/primary`)).data,
  remove: async (id?: string) => (await httpClient.delete(`/contacts/${String(id)}`)).data,
  /** Bulk status change — same shape as the owner reassignment. */
  assignStatus: async (body?: { ids: string[]; status: string }) => {
    await Promise.all(
      (body?.ids ?? []).map((id) => httpClient.put(`/contacts/${id}`, { status: body?.status })),
    );
    return { data: true };
  },
  /** Bulk owner reassignment — one PUT per contact, awaited together. */
  assignOwner: async (body?: { ids: string[]; ownerId: string }) => {
    await Promise.all(
      (body?.ids ?? []).map((id) =>
        httpClient.put(`/contacts/${id}`, { ownerId: body?.ownerId ?? null }),
      ),
    );
    return { data: true };
  },
});
