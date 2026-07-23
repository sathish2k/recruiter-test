import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const profileDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/profile")).data,
  update: async (body?: Record<string, unknown>) => (await httpClient.put("/profile", body)).data,
  /** Pushes the picked avatar to storage; the API returns the presented asset
   * (public URL under `data.url`) which the caller then saves onto the user. */
  uploadAvatar: async (file?: File) => {
    const form = new FormData();
    if (file) form.append("file", file);
    form.append("entityType", "member");
    form.append("type", "avatar");
    return (await httpClient.post("/assets", form)).data;
  },
});
