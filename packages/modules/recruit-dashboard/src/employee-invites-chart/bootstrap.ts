import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EmployeeInvitesChartComponent } from "./employee-invites-chart.component";
import { employeeInvitesChartDatasource } from "./employee-invites-chart.datasource";
import fallbackTranslation from "./employee-invites-chart.translations.json";

const EMPLOYEE_INVITES_CHART_TRANSLATION: ComponentDependency = {
  id: "Recruit.EmployeeInvitesChart.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const EMPLOYEE_INVITES_CHART_DATASOURCE: ComponentDependency = {
  id: "Recruit.EmployeeInvitesChart.Datasource",
  type: "DATASOURCE",
  value: employeeInvitesChartDatasource,
};

export const EMPLOYEE_INVITES_CHART_COMPONENT: ComponentDefinition = {
  id: "Recruit.EmployeeInvitesChart.Component",
  type: "COMPONENT",
  value: EmployeeInvitesChartComponent,
  default: {
    translation: EMPLOYEE_INVITES_CHART_TRANSLATION,
    datasource: EMPLOYEE_INVITES_CHART_DATASOURCE,
  },
};
