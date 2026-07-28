import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const candidateImportDatasource = (): DatasourceInstance => ({
  /** Nothing to read — the screen's data is whatever was dropped on it. */
  get: async () => ({}),
  /** One row per candidate; the server runs the duplicate check on each. */
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/candidates/import", body)).data,
  /** The same contract-driven parse the candidate form uses for autofill. */
  parseDocument: async (file?: File, fields?: unknown) => {
    const form = new FormData();
    if (file) form.append("file", file);
    form.append("fields", JSON.stringify(fields ?? []));
    const response = await httpClient.post("/extractions/document", form);
    return (response.data as { data?: Record<string, unknown> })?.data ?? {};
  },
});
