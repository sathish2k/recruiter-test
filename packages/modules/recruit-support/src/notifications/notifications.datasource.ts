import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const notificationsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/notifications")).data,
  markAll: async () => (await httpClient.patch("/notifications/read-all")).data,
  markRead: async (body?: Record<string, unknown>) =>
    (await httpClient.patch(`/notifications/${String(body?.id)}/read`)).data,
});
