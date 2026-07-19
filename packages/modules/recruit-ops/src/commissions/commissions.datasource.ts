import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const commissionsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/commissions", { params: query })).data,
  markPaid: async (id?: string) =>
    (await httpClient.patch(`/commissions/${id}/paid`)).data,
});
