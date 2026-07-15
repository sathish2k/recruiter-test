import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EmployeeGreetingComponent } from "./employee-greeting.component";
import { employeeGreetingDatasource } from "./employee-greeting.datasource";
import fallbackTranslation from "./employee-greeting.translations.json";

const EMPLOYEE_GREETING_TRANSLATION: ComponentDependency = {
  id: "Recruit.EmployeeGreeting.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const EMPLOYEE_GREETING_DATASOURCE: ComponentDependency = {
  id: "Recruit.EmployeeGreeting.Datasource",
  type: "DATASOURCE",
  value: employeeGreetingDatasource,
};

export const EMPLOYEE_GREETING_COMPONENT: ComponentDefinition = {
  id: "Recruit.EmployeeGreeting.Component",
  type: "COMPONENT",
  value: EmployeeGreetingComponent,
  default: {
    translation: EMPLOYEE_GREETING_TRANSLATION,
    datasource: EMPLOYEE_GREETING_DATASOURCE,
  },
};
