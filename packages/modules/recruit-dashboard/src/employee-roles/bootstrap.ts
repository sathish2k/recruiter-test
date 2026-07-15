import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { EmployeeRolesComponent } from "./employee-roles.component";
import { EmployeeRolesConfiguration } from "./employee-roles.configuration";
import { employeeRolesDatasource } from "./employee-roles.datasource";
import fallbackTranslation from "./employee-roles.translations.json";

const EMPLOYEE_ROLES_CONFIGURATION: ComponentDependency = {
  id: "Recruit.EmployeeRoles.Configuration",
  type: "CONFIGURATION",
  value: EmployeeRolesConfiguration,
};

const EMPLOYEE_ROLES_TRANSLATION: ComponentDependency = {
  id: "Recruit.EmployeeRoles.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const EMPLOYEE_ROLES_DATASOURCE: ComponentDependency = {
  id: "Recruit.EmployeeRoles.Datasource",
  type: "DATASOURCE",
  value: employeeRolesDatasource,
};

export const EMPLOYEE_ROLES_COMPONENT: ComponentDefinition = {
  id: "Recruit.EmployeeRoles.Component",
  type: "COMPONENT",
  value: EmployeeRolesComponent,
  default: {
    configuration: EMPLOYEE_ROLES_CONFIGURATION,
    translation: EMPLOYEE_ROLES_TRANSLATION,
    datasource: EMPLOYEE_ROLES_DATASOURCE,
  },
};
