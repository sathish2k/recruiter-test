import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EmployeeFunnelComponent } from "./employee-funnel.component";
import { employeeFunnelDatasource } from "./employee-funnel.datasource";
import fallbackTranslation from "./employee-funnel.translations.json";

const EMPLOYEE_FUNNEL_TRANSLATION: ComponentDependency = {
  id: "Recruit.EmployeeFunnel.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const EMPLOYEE_FUNNEL_DATASOURCE: ComponentDependency = {
  id: "Recruit.EmployeeFunnel.Datasource",
  type: "DATASOURCE",
  value: employeeFunnelDatasource,
};

export const EMPLOYEE_FUNNEL_COMPONENT: ComponentDefinition = {
  id: "Recruit.EmployeeFunnel.Component",
  type: "COMPONENT",
  value: EmployeeFunnelComponent,
  default: {
    translation: EMPLOYEE_FUNNEL_TRANSLATION,
    datasource: EMPLOYEE_FUNNEL_DATASOURCE,
  },
};
