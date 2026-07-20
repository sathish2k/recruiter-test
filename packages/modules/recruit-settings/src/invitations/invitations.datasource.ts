import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const invitationsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/invitations", { params: query })).data,
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/invitations", body)).data,
  delete: async (id?: string) => (await httpClient.delete(`/invitations/${String(id)}`)).data,
  resend: async (id?: string) => (await httpClient.post(`/invitations/${String(id)}/resend`)).data,
});
