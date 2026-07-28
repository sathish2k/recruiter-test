import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const contactFormDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    query?.id ? (await httpClient.get(`/contacts/${String(query.id)}`)).data : {},
  create: async (body?: Record<string, unknown>) => (await httpClient.post("/contacts", body)).data,
  /** Same-client contacts matching by email, mobile or first+last name. */
  checkDuplicates: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/contacts/duplicates", { params: query })).data,
  update: async (body?: Record<string, unknown>) => {
    const { id, ...rest } = body ?? {};
    return (await httpClient.put(`/contacts/${String(id)}`, rest)).data;
  },
  /** Uploads one attachment and returns its stored `{ name, url, size, type }`.
   * The endpoint lives here (the data layer), so the widget stays link-free. */
  uploadAsset: async (file?: File, onProgress?: (percent: number) => void) => {
    const form = new FormData();
    if (file) form.append("file", file);
    form.append("entityType", "contact");
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
  /** Quick-creates a client from the contact form, returning the new row. */
  createClient: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/clients", body)).data,
});
