import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const emailTemplatesDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/email-templates")).data,
  create: async (body?: Record<string, unknown>) =>
    (await httpClient.post("/email-templates", body)).data,
  update: async (body?: Record<string, unknown>) =>
    (await httpClient.put(`/email-templates/${String(body?.id)}`, body)).data,
  delete: async (id?: string) => (await httpClient.delete(`/email-templates/${String(id)}`)).data,
});

/** Restores the copy a built-in template shipped with. */
export const resetEmailTemplate = async (id: string) =>
  (await httpClient.post(`/email-templates/${id}/reset`)).data;

/** Sends the template to one address using the editor's sample values. */
export const sendTestEmail = async (id: string, to: string, sample: Record<string, string>) =>
  (await httpClient.post(`/email-templates/${id}/test`, { to, sample })).data;

/** Runs an AI rewrite over the draft body; returns the rewritten text. */
export const assistEmailBody = async (action: string, body: string) =>
  (await httpClient.post<{ data: { body: string } }>("/email-templates/assist", { action, body }))
    .data;
