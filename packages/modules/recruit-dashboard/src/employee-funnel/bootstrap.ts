import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { FunnelRenderer } from "@recruit/shared";
import { EmployeeFunnelConfiguration } from "./employee-funnel.configuration";
import { employeeFunnelDatasource } from "./employee-funnel.datasource";
import fallbackTranslation from "./employee-funnel.translations.json";

const EMPLOYEE_FUNNEL_CONFIGURATION: ComponentDependency = {
  id: "Recruit.EmployeeFunnel.Configuration",
  type: "CONFIGURATION",
  value: EmployeeFunnelConfiguration,
};

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
  value: FunnelRenderer,
  default: {
    configuration: EMPLOYEE_FUNNEL_CONFIGURATION,
    translation: EMPLOYEE_FUNNEL_TRANSLATION,
    datasource: EMPLOYEE_FUNNEL_DATASOURCE,
  },
};
