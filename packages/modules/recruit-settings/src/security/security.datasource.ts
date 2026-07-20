import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const securityDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/security")).data,
  /** Change password — the one mutation that goes through the profile route. */
  update: async (body?: Record<string, unknown>) =>
    (await httpClient.put("/profile/password", body)).data,
  revokeSession: async (id?: string) =>
    (await httpClient.delete(`/security/sessions/${String(id)}`)).data,
  revokeOtherSessions: async () => (await httpClient.delete("/security/sessions")).data,
  createToken: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/security/tokens", body)).data,
  revokeToken: async (id?: string) =>
    (await httpClient.delete(`/security/tokens/${String(id)}`)).data,
  setTwoFactor: async (enabled?: boolean) =>
    (await httpClient.put("/security/two-factor", { enabled })).data,
  regenerateCodes: async () => (await httpClient.post("/security/recovery-codes")).data,
  setNotifications: async (body?: Record<string, unknown>) =>
    (await httpClient.put("/security/notifications", body)).data,
  addRecipient: async (email?: string) =>
    (await httpClient.post("/security/recipients", { email })).data,
  removeRecipient: async (id?: string) =>
    (await httpClient.delete(`/security/recipients/${String(id)}`)).data,
});
