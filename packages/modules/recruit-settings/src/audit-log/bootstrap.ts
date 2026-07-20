import type { ComponentDefinition, ComponentDependency } from "@recruit/sdk";
import { SettingsAuditLogComponent } from "./audit-log.component";
import { AuditLogConfiguration } from "./audit-log.configuration";
import { auditLogDatasource } from "./audit-log.datasource";
import fallbackTranslation from "./audit-log.translations.json";

const CONFIGURATION: ComponentDependency = {
  id: "Recruit.SettingsAuditLog.Configuration",
  type: "CONFIGURATION",
  value: AuditLogConfiguration,
};

const TRANSLATION: ComponentDependency = {
  id: "Recruit.SettingsAuditLog.Translation",
  type: "TRANSLATION",
  value: { fallback: fallbackTranslation },
};

const DATASOURCE: ComponentDependency = {
  id: "Recruit.SettingsAuditLog.Datasource",
  type: "DATASOURCE",
  value: auditLogDatasource,
};

export const SETTINGS_AUDIT_LOG_COMPONENT: ComponentDefinition = {
  id: "Recruit.SettingsAuditLog.Component",
  type: "COMPONENT",
  value: SettingsAuditLogComponent,
  default: {
    configuration: CONFIGURATION,
    translation: TRANSLATION,
    datasource: DATASOURCE,
  },
};
