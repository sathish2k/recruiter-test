import { type DatasourceInstance, httpClient } from "@recruit/sdk";

const clean = (query?: Record<string, unknown>) =>
  Object.fromEntries(
    Object.entries(query ?? {}).filter(
      ([, v]) => v !== undefined && v !== null && v !== "",
    ),
  );

export const pipelineDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) =>
    (await httpClient.get("/pipeline", { params: clean(query) })).data,
  update: async (body?: Record<string, unknown>) =>
    (
      await httpClient.patch(`/pipeline/${String(body?.id)}/stage`, {
        stage: body?.stage,
      })
    ).data,
});
