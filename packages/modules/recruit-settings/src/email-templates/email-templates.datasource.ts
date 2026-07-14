import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const emailTemplatesDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/email-templates")).data,
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/email-templates", body)).data,
  update: async (body?: Record<string, unknown>) =>
    (await httpClient.put(`/email-templates/${String(body?.id)}`, body)).data,
  delete: async (id?: string) =>
    (await httpClient.delete(`/email-templates/${String(id)}`)).data,
});
