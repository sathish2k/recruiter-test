import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const jobDetailPipelineDatasource = (): DatasourceInstance => ({
  get: async (query?: Record<string, unknown>) => {
    const id = query?.id ? String(query.id) : "";
    if (!id) return { data: [], meta: {} };
    return (await httpClient.get(`/jobs/${id}/stages`)).data;
  },
});
