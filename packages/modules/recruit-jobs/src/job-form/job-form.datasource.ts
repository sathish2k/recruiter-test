import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const jobFormDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    query?.id ? (await httpClient.get(`/jobs/${String(query.id)}`)).data : {},
  create: async (body?: Record<string, unknown>) => (await httpClient.post("/jobs", body)).data,
  update: async (body?: Record<string, unknown>) => {
    const { id, ...rest } = body ?? {};
    return (await httpClient.put(`/jobs/${String(id)}`, rest)).data;
  },
  /** Recent jobs whose written sections can be copied into a new one — the
   * design`s Templates menu, sourced from work the agency has already done. */
  listTemplates: async () => {
    const response = await httpClient.get("/jobs", { params: { page: 1, pageSize: 12 } });
    return (response.data as { data?: unknown[] })?.data ?? [];
  },
  /** Reads structured values out of text the form already holds — skills from
   * a title and description, or a description from the rest of the brief. */
  parseText: async (text?: string, fields?: unknown) => {
    const response = await httpClient.post("/extractions/text", {
      text: String(text ?? ""),
      fields: JSON.stringify(fields ?? []),
    });
    return (response.data as { data?: Record<string, unknown> })?.data ?? {};
  },
  /** Uploads one attachment and returns its stored `{ name, url, size, type }`. */
  uploadAsset: async (file?: File, onProgress?: (percent: number) => void) => {
    const form = new FormData();
    if (file) form.append("file", file);
    form.append("entityType", "job");
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
