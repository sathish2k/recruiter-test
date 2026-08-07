import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const sourcerWeekGoalsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/week-goals")).data,
});
