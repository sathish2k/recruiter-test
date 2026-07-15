import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EmployeeAiActivityComponent } from "./employee-ai-activity.component";
import { employeeAiActivityDatasource } from "./employee-ai-activity.datasource";
import fallbackTranslation from "./employee-ai-activity.translations.json";

const EMPLOYEE_AI_ACTIVITY_TRANSLATION: ComponentDependency = {
  id: "Recruit.EmployeeAiActivity.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const EMPLOYEE_AI_ACTIVITY_DATASOURCE: ComponentDependency = {
  id: "Recruit.EmployeeAiActivity.Datasource",
  type: "DATASOURCE",
  value: employeeAiActivityDatasource,
};

export const EMPLOYEE_AI_ACTIVITY_COMPONENT: ComponentDefinition = {
  id: "Recruit.EmployeeAiActivity.Component",
  type: "COMPONENT",
  value: EmployeeAiActivityComponent,
  default: {
    translation: EMPLOYEE_AI_ACTIVITY_TRANSLATION,
    datasource: EMPLOYEE_AI_ACTIVITY_DATASOURCE,
  },
};
