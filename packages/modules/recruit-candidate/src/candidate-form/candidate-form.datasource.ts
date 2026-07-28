import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const candidateFormDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    query?.id ? (await httpClient.get(`/candidates/${String(query.id)}`)).data : {},
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/candidates", body)).data,
  update: async (body?: Record<string, unknown>) => {
    const { id, ...rest } = body ?? {};
    return (await httpClient.put(`/candidates/${String(id)}`, rest)).data;
  },
  /** The workspace's duplicate check — the same one import and apply run. */
  checkDuplicates: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/candidates/duplicates", { params: query })).data,
  /** Field-level merge into an existing candidate (TC-CAN-002). */
  merge: async (body?: Record<string, unknown>) => {
    const { id, ...rest } = body ?? {};
    return (await httpClient.post(`/candidates/${String(id)}/merge`, rest)).data;
  },
  /** Server-side document parsing. The `fields` contract is derived from the
   * form's own schema, so nothing about candidates is hardcoded server-side. */
  parseDocument: async (file?: File, fields?: unknown) => {
    const form = new FormData();
    if (file) form.append("file", file);
    form.append("fields", JSON.stringify(fields ?? []));
    const response = await httpClient.post("/extractions/document", form);
    return (response.data as { data?: Record<string, unknown> })?.data ?? {};
  },
  uploadAsset: async (file?: File, onProgress?: (percent: number) => void) => {
    const form = new FormData();
    if (file) form.append("file", file);
    form.append("entityType", "candidate");
    form.append("type", "attachment");
    const response = await httpClient.post("/assets", form, {
      onUploadProgress: onProgress
        ? (event: { loaded: number; total?: number }) => {
            if (event.total) onProgress(Math.round((event.loaded / event.total) * 100));
          }
        : undefined,
    });
    const body = response.data as { data?: { url?: string } };
    return {
      name: file?.name ?? "",
      url: body?.data?.url ?? "",
      size: file?.size,
      type: file?.type,
    };
  },
});
