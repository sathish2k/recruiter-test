import type {
  StatCardRendererConfig,
  TableRendererConfig,
} from "@recruit/shared";

export interface TeamActivityConfig {
  jobRouteId: string;
  kpiCards: StatCardRendererConfig[];
  byEmployee: TableRendererConfig;
  byRole: TableRendererConfig;
}

const ORANGE = "#FF9D57";
const GREEN = "#8FD6AC";
const MUTED_ICON = "#7C7972";
const KPI_VALUE_SX = { fontSize: 25 };
const KPI_SUB_SX = { fontSize: 11.5, color: "text.disabled" };

const byEmployee: TableRendererConfig = {
  header: { title: "byEmployee.title" },
  emptyLabel: "byEmployee.empty",
  columns: [
    {
      label: { name: "byEmployee.columns.employee" },
      value: {
        type: "entity",
        shape: "circle",
        size: 32,
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "name",
        subtitle: "rolesSub",
      },
    },
    {
      label: { name: "byEmployee.columns.invites" },
      width: 150,
      value: { type: "invitesBar" },
    },
    {
      label: { name: "byEmployee.columns.connected" },
      align: "right",
      value: { type: "number", path: "connected" },
    },
    {
      label: { name: "byEmployee.columns.jds" },
      align: "right",
      value: { type: "number", path: "jds" },
    },
    {
      label: { name: "byEmployee.columns.cvs" },
      align: "right",
      value: { type: "number", path: "cvs", sx: { color: ORANGE } },
    },
    {
      label: { name: "byEmployee.columns.submitted" },
      align: "right",
      value: { type: "number", path: "submitted" },
    },
    {
      label: { name: "byEmployee.columns.approval" },
      align: "right",
      value: { type: "approval" },
    },
  ],
};

const byRole: TableRendererConfig = {
  header: { title: "byRole.title" },
  emptyLabel: "byRole.empty",
  rowRouteId: "Recruit.JobDetail.Route",
  columns: [
    { label: { name: "byRole.columns.role" }, value: { type: "roleCell" } },
    {
      label: { name: "byRole.columns.employee" },
      value: { type: "empCell" },
    },
    { label: { name: "byRole.columns.lead" }, value: { type: "leadCell" } },
    {
      label: { name: "byRole.columns.invites" },
      align: "right",
      value: { type: "number", path: "invites" },
    },
    {
      label: { name: "byRole.columns.connected" },
      align: "right",
      value: { type: "number", path: "connected" },
    },
    {
      label: { name: "byRole.columns.cvs" },
      align: "right",
      value: { type: "number", path: "cvs", sx: { color: ORANGE } },
    },
    {
      label: { name: "byRole.columns.submitted" },
      align: "right",
      value: { type: "number", path: "submitted" },
    },
  ],
};

export const TeamActivityConfiguration: TeamActivityConfig = {
  jobRouteId: "Recruit.JobDetail.Route",
  byEmployee,
  byRole,
  kpiCards: [
    {
      variant: "accent",
      icon: { name: "person-add", size: 16, color: ORANGE },
      label: { name: "kpis.invites" },
      value: { type: "number", path: "invites", sx: KPI_VALUE_SX },
      sub: { name: "kpis.invitesSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "call", size: 16, color: MUTED_ICON },
      label: { name: "kpis.connections" },
      value: { type: "number", path: "connections", sx: KPI_VALUE_SX },
      sub: { name: "kpis.connectionsSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "description", size: 16, color: MUTED_ICON },
      label: { name: "kpis.cvs" },
      value: {
        type: "number",
        path: "cvs",
        sx: { ...KPI_VALUE_SX, color: ORANGE },
      },
      sub: { name: "kpis.cvsSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "send", size: 16, color: MUTED_ICON },
      label: { name: "kpis.submitted" },
      value: { type: "number", path: "submitted", sx: KPI_VALUE_SX },
      sub: { name: "kpis.submittedSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "check-circle", size: 16, color: GREEN },
      label: { name: "kpis.approval" },
      value: {
        type: "number",
        path: "approval",
        suffix: "%",
        sx: { ...KPI_VALUE_SX, color: GREEN },
      },
      sub: { name: "kpis.approvalSub", sx: KPI_SUB_SX },
    },
  ],
};
