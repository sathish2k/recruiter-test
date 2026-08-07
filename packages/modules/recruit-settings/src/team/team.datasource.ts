import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const teamDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/users", { params: query })).data,
  /** Inviting is a bulk send — `{ emails: [...], role }`. */
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/invitations", body)).data,
  /** Name, role and team in one call — the edit dialog's three fields. */
  update: async (body?: Record<string, unknown>) =>
    (
      await httpClient.patch(`/users/${String(body?.id)}`, {
        name: body?.name,
        role: body?.role,
        team: body?.team,
      })
    ).data,
  deactivate: async (id?: string) =>
    (await httpClient.post(`/users/${String(id)}/deactivate`)).data,
  /** The way back from deactivate — refused by the API when no seat is free. */
  activate: async (id?: string) => (await httpClient.post(`/users/${String(id)}/activate`)).data,
  /** Reversible, unlike deactivate — the design's menu toggles it. */
  suspend: async (body?: { id: string; suspended: boolean }) =>
    (await httpClient.post(`/users/${String(body?.id)}/suspend`, { suspended: body?.suspended }))
      .data,
  resetPassword: async (id?: string) =>
    (await httpClient.post(`/users/${String(id)}/reset-password`)).data,
  /** An invited member's row is backed by their pending invitation, so the
   * resend goes to the invitation endpoint. */
  resendInvite: async (id?: string) =>
    (await httpClient.post(`/invitations/${String(id)}/resend`)).data,
  remove: async (id?: string) => (await httpClient.delete(`/users/${String(id)}`)).data,
});
