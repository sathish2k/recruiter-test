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
