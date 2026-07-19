import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { AuditLogComponent } from "./audit-log.component";
import { AuditLogConfiguration } from "./audit-log.configuration";
import { auditLogDatasource } from "./audit-log.datasource";
import fallbackTranslation from "./audit-log.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.AuditLog.Configuration",
  type: "CONFIGURATION",
  value: AuditLogConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.AuditLog.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.AuditLog.Datasource",
  type: "DATASOURCE",
  value: auditLogDatasource,
};

export const AUDIT_LOG_COMPONENT: ComponentDefinition = {
  id: "Recruit.AuditLog.Component",
  type: "COMPONENT",
  value: AuditLogComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
