import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EmployeeKpisComponent } from "./employee-kpis.component";
import { EmployeeKpisConfiguration } from "./employee-kpis.configuration";
import { employeeKpisDatasource } from "./employee-kpis.datasource";
import fallbackTranslation from "./employee-kpis.translations.json";

const EMPLOYEE_KPIS_CONFIGURATION: ComponentDependency = {
  id: "Recruit.EmployeeKpis.Configuration",
  type: "CONFIGURATION",
  value: EmployeeKpisConfiguration,
};

const EMPLOYEE_KPIS_TRANSLATION: ComponentDependency = {
  id: "Recruit.EmployeeKpis.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const EMPLOYEE_KPIS_DATASOURCE: ComponentDependency = {
  id: "Recruit.EmployeeKpis.Datasource",
  type: "DATASOURCE",
  value: employeeKpisDatasource,
};

export const EMPLOYEE_KPIS_COMPONENT: ComponentDefinition = {
  id: "Recruit.EmployeeKpis.Component",
  type: "COMPONENT",
  value: EmployeeKpisComponent,
  default: {
    configuration: EMPLOYEE_KPIS_CONFIGURATION,
    translation: EMPLOYEE_KPIS_TRANSLATION,
    datasource: EMPLOYEE_KPIS_DATASOURCE,
  },
};
