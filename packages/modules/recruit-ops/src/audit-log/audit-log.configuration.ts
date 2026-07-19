export interface AuditFilter {
  key: string;
  label: string;
}

export interface AuditSwatch {
  bg: string;
  fg: string;
}

export interface AuditLogConfig {
  filters: AuditFilter[];
  kindColors: Record<string, string>;
  kindLabels: Record<string, string>;
  actorColors: Record<string, AuditSwatch>;
  defaultActor: AuditSwatch;
  mutedKind: string;
}

export const AuditLogConfiguration: AuditLogConfig = {
  filters: [
    { key: "all", label: "filters.all" },
    { key: "permissions", label: "filters.permissions" },
    { key: "candidates", label: "filters.candidates" },
    { key: "client", label: "filters.client" },
    { key: "jobs", label: "filters.jobs" },
    { key: "billing", label: "filters.billing" },
    { key: "system", label: "filters.system" },
  ],
  kindColors: {
    permissions: "#F0B27C",
    candidates: "#9BB8D9",
    client: "#8FD6AC",
    jobs: "#C9C5BD",
    billing: "#F0C27C",
    system: "#7C7972",
  },
  kindLabels: {
    permissions: "kinds.permissions",
    candidates: "kinds.candidates",
    client: "kinds.client",
    jobs: "kinds.jobs",
    billing: "kinds.billing",
    system: "kinds.system",
  },
  actorColors: {
    orange: { bg: "#5B4A3A", fg: "#F5D9BF" },
    blue: { bg: "#3A4A5B", fg: "#CFE3F5" },
    green: { bg: "#3A5B4A", fg: "#CFF5E1" },
    slate: { bg: "#3A4150", fg: "#D5DCE6" },
    amber: { bg: "#5B4A3A", fg: "#F5E1CF" },
  },
  defaultActor: { bg: "#3A4A5B", fg: "#CFE3F5" },
  mutedKind: "#7C7972",
};
