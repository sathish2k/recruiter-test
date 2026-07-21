import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const organizationDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/organization")).data,
  update: async (body?: Record<string, unknown>) =>
    (await httpClient.put("/organization", body)).data,
  /** Pushes the picked logo to R2; the API stores it under
   * organizations/{orgId}/logo.webp and returns the public URL. */
  uploadLogo: async (file?: File) => {
    const form = new FormData();
    if (file) form.append("file", file);
    form.append("entityType", "organization");
    form.append("type", "logo");
    return (await httpClient.post("/assets", form)).data;
  },
  logo: async () =>
    (await httpClient.get("/assets", { params: { entityType: "organization", type: "logo" } }))
      .data,
});
