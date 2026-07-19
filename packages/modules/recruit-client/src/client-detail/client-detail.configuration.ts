import type {
  JsonSchema,
  StatCardRendererConfig,
  TableRendererConfig,
} from "@recruit/shared";

export interface ClientDetailConfig {
  kpis: StatCardRendererConfig[];
  rolesTable: TableRendererConfig;
  editForm: JsonSchema;
  addJobRouteId: string;
  feesRouteId: string;
  backRouteId: string;
  jobDetailRouteId: string;
}

const kpis: StatCardRendererConfig[] = [
  {
    label: { name: "kpi.openRoles" },
    value: { type: "number", path: "openRoles" },
    icon: { name: "work", color: "#F0B27C" },
  },
  {
    label: { name: "kpi.pipeline" },
    value: { type: "number", path: "pipeline" },
    icon: { name: "group", color: "#F0B27C" },
  },
  {
    label: { name: "kpi.awaiting" },
    value: { type: "number", path: "awaiting" },
    variant: "accent",
    icon: { name: "schedule", color: "#FF9D57" },
    sub: { name: "kpi.awaitingSub" },
  },
  {
    label: { name: "kpi.hires" },
    value: { type: "number", path: "hires" },
    icon: { name: "handshake", color: "#8FD6AC" },
    sub: { name: "kpi.hiresSub" },
  },
];

const rolesTable: TableRendererConfig = {
  rowRouteId: "Recruit.JobDetail.Route",
  emptyLabel: "roles.empty",
  columns: [
    { label: { name: "roles.cols.role" }, value: { type: "roleTitle" } },
    { label: { name: "roles.cols.employee" }, value: { type: "employee" } },
    {
      label: { name: "roles.cols.lead" },
      value: { type: "string", path: "leadName" },
    },
    {
      label: { name: "roles.cols.pipeline" },
      value: { type: "number", path: "pipeline" },
      align: "right",
    },
    {
      label: { name: "roles.cols.submitted" },
      value: { type: "number", path: "submitted" },
      align: "right",
    },
    {
      label: { name: "roles.cols.status" },
      value: {
        type: "pill",
        path: "status",
        styles: {
          Active: {
            fg: "#8FD6AC",
            bg: "rgba(78,168,116,.14)",
            border: "rgba(78,168,116,.35)",
          },
          Draft: {
            fg: "#F0C27C",
            bg: "rgba(214,155,60,.14)",
            border: "rgba(214,155,60,.35)",
          },
          Closed: {
            fg: "#9A968E",
            bg: "rgba(255,255,255,.06)",
            border: "rgba(255,255,255,.12)",
          },
        },
      },
    },
  ],
};

const editForm: JsonSchema = {
  type: "object",
  properties: {
    name: { type: "string", title: "edit.fields.name" },
    industry: { type: "string", title: "edit.fields.industry" },
    manager: {
      type: "string",
      title: "edit.fields.manager",
      enum: ["Riya Kapoor", "Dev Shah", "Ana Novak"],
    },
    primaryContact: { type: "string", title: "edit.fields.primaryContact" },
    placementFee: { type: "string", title: "edit.fields.placementFee" },
    status: {
      type: "string",
      title: "edit.fields.status",
      widget: "segmented",
      enum: ["Hiring", "Paused"],
    },
  },
  required: ["name"],
  errorMessage: { required: { name: "edit.fields.nameRequired" } },
};

export const ClientDetailConfiguration: ClientDetailConfig = {
  kpis,
  rolesTable,
  editForm,
  addJobRouteId: "Recruit.AddJob.Route",
  feesRouteId: "Recruit.Placements.Route",
  backRouteId: "Recruit.Clients.Route",
  jobDetailRouteId: "Recruit.JobDetail.Route",
};
