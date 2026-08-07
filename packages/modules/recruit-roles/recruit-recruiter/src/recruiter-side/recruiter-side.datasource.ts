import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const recruiterSideDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/upcoming-interviews")).data,
});
