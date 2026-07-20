import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const billingDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/billing")).data,
  changeSeats: async (delta?: number) => (await httpClient.post("/billing/seats", { delta })).data,
  changePlan: async (plan?: string) => (await httpClient.put("/billing/plan", { plan })).data,
  updatePayment: async (body?: Record<string, unknown>) =>
    (await httpClient.put("/billing/payment", body)).data,
});
