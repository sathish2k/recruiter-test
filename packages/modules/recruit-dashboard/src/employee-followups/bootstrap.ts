import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EmployeeFollowupsComponent } from "./employee-followups.component";
import { employeeFollowupsDatasource } from "./employee-followups.datasource";
import fallbackTranslation from "./employee-followups.translations.json";

const EMPLOYEE_FOLLOWUPS_TRANSLATION: ComponentDependency = {
  id: "Recruit.EmployeeFollowups.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const EMPLOYEE_FOLLOWUPS_DATASOURCE: ComponentDependency = {
  id: "Recruit.EmployeeFollowups.Datasource",
  type: "DATASOURCE",
  value: employeeFollowupsDatasource,
};

export const EMPLOYEE_FOLLOWUPS_COMPONENT: ComponentDefinition = {
  id: "Recruit.EmployeeFollowups.Component",
  type: "COMPONENT",
  value: EmployeeFollowupsComponent,
  default: {
    translation: EMPLOYEE_FOLLOWUPS_TRANSLATION,
    datasource: EMPLOYEE_FOLLOWUPS_DATASOURCE,
  },
};
