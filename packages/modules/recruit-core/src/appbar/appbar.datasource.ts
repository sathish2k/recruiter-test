import { type DatasourceInstance, httpClient } from "@recruit/sdk";

/** The workspace shown in the avatar menu (name + seat count). */
export const appbarDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/organization")).data,
});
