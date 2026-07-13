import { type DatasourceInstance, httpClient } from "@recruit/sdk";

// Multiselect filters arrive as arrays — the API takes comma-joined strings.
const normalize = (query?: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(query ?? {}).map(([k, v]) => [
      k,
      Array.isArray(v) ? v.join(",") : v,
    ]),
  );

export const jobsDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/jobs", { params: normalize(query) })).data,
});
