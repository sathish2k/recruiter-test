import { type DatasourceInstance, httpClient } from "@recruit/sdk";

// No list data — the toolbar only needs `create` for the New Job form. `get`
// is a no-op so useFetch resolves without a network call.
export const toolbarDatasource = (): DatasourceInstance => ({
  get: async () => ({}),
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/jobs", body)).data,
});
