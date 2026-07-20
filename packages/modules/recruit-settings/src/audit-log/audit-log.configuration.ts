import type { ExportConfig, FilterConfig } from "@recruit/shared";

export interface AuditLogConfig {
  filters: FilterConfig[];
  export: ExportConfig;
  pageSize: number;
  /** Source tile icon per category. */
  icons: Record<string, string>;
}

export const AuditLogConfiguration: AuditLogConfig = {
  filters: [
    { type: "search", key: "search", placeholder: "search" },
    {
      type: "select",
      key: "category",
      label: { name: "filters.category" },
      options: [
        { label: "categories.permissions", value: "permissions" },
        { label: "categories.candidates", value: "candidates" },
        { label: "categories.clientActions", value: "clientActions" },
        { label: "categories.requirements", value: "requirements" },
        { label: "categories.billing", value: "billing" },
        { label: "categories.system", value: "system" },
        { label: "categories.security", value: "security" },
        { label: "categories.integrations", value: "integrations" },
        { label: "categories.email", value: "email" },
      ],
    },
    {
      type: "select",
      key: "result",
      label: { name: "filters.result" },
      options: [
        { label: "results.success", value: "success" },
        { label: "results.warning", value: "warning" },
        { label: "results.failure", value: "failure" },
      ],
    },
    {
      type: "select",
      key: "range",
      label: { name: "filters.range" },
      options: [
        { label: "ranges.today", value: "today" },
        { label: "ranges.7d", value: "7d" },
        { label: "ranges.30d", value: "30d" },
      ],
    },
  ],

  export: {
    types: [
      { label: "exportTypes.csv", value: "csv", icon: "csv" },
      { label: "exportTypes.json", value: "json", icon: "json" },
      { label: "exportTypes.xlsx", value: "xlsx", icon: "excel" },
    ],
  },

  pageSize: 8,

  icons: {
    security: "lock",
    email: "mail",
    system: "smart-toy",
    clientActions: "domain",
    integrations: "hub",
    billing: "credit-card",
    permissions: "shield-person",
    candidates: "person",
    requirements: "description",
  },
};
