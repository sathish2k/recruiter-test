import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const placementsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/placements")).data,
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/placements", body)).data,
  updateInvoice: async (id?: string, invoiceStatus?: string) =>
    (await httpClient.patch(`/placements/${id}/invoice`, { invoiceStatus }))
      .data,
  updateStatus: async (id?: string, status?: string) =>
    (await httpClient.patch(`/placements/${id}/status`, { status })).data,
});
