import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const portalLoginDatasource = (): DatasourceInstance => ({
  magicLink: async (email?: string) =>
    (await httpClient.post("/client-portal/magic-link", { email })).data,
});
