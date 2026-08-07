import { type DatasourceInstance, httpClient } from "@recruit/sdk";

export const hiringManagerWeekGoalsDatasource = (): DatasourceInstance => ({
  get: async () => (await httpClient.get("/dashboard/week-goals")).data,
});
