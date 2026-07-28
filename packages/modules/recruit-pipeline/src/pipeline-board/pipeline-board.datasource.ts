import { type DatasourceInstance, httpClient } from "@recruit/sdk";

interface Envelope {
  data?: unknown;
}

const body = (response: { data: unknown }) =>
  ((response.data as Envelope)?.data as Record<string, unknown>) ?? {};

export const pipelineBoardDatasource = (): DatasourceInstance => ({
  /** Columns, owners and SLA breaches in one call. */
  get: async (query?: Record<string, unknown>) => {
    const params: Record<string, string> = {};
    for (const [key, value] of Object.entries(query ?? {})) {
      if (value !== undefined && value !== null && value !== "") params[key] = String(value);
    }
    return body(await httpClient.get("/applications/board", { params }));
  },
  /** The one write that moves an application — see moveApplication. */
  move: async (body_?: Record<string, unknown>) => {
    const { id, ...rest } = body_ ?? {};
    return (await httpClient.post(`/applications/${String(id)}/move`, rest)).data;
  },
  /** The workspace's rejection catalogue, for the move modal. */
  rejectionReasons: async () => body(await httpClient.get("/pipeline/rejection-reasons")),
});
