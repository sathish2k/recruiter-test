import type {
  StatCardRendererConfig,
  TableRendererConfig,
} from "@recruit/shared";

export interface InterviewsConfig {
  candidateRouteId: string;
  kpiCards: StatCardRendererConfig[];
  upcoming: TableRendererConfig;
}

const ACCENT_ICON = "#FF9D57";
const MUTED_ICON = "#7C7972";
const KPI_VALUE_SX = { fontSize: 27 };
const KPI_SUB_SX = { fontSize: 11.5, color: "text.disabled" };

const upcoming: TableRendererConfig = {
  emptyLabel: "upcoming.empty",
  rowRouteId: "Recruit.CandidateDetail.Route",
  columns: [
    {
      label: { name: "upcoming.columns.when" },
      width: 130,
      value: { type: "text", path: "day", sx: { fontWeight: 600 } },
    },
    {
      label: { name: "upcoming.columns.candidate" },
      value: {
        type: "entity",
        shape: "circle",
        size: 30,
        bgPath: "avatarBg",
        fgPath: "avatarFg",
        textPath: "initials",
        title: "name",
      },
    },
    {
      label: { name: "upcoming.columns.roleClient" },
      value: {
        type: "text",
        path: "roleClient",
        sx: { color: "text.secondary" },
      },
    },
    {
      label: { name: "upcoming.columns.round" },
      value: { type: "text", path: "round", sx: { color: "text.secondary" } },
    },
    {
      label: { name: "upcoming.columns.interviewer" },
      value: { type: "text", path: "with", sx: { color: "text.secondary" } },
    },
    {
      label: { name: "upcoming.columns.status" },
      value: {
        type: "status",
        path: "status",
        variant: "soft",
        labels: {
          Confirmed: "status.confirmed",
          Pending: "status.pending",
        },
        colors: { Confirmed: "success", Pending: "warning" },
      },
    },
  ],
};

export const InterviewsConfiguration: InterviewsConfig = {
  candidateRouteId: "Recruit.CandidateDetail.Route",
  upcoming,
  kpiCards: [
    {
      variant: "accent",
      icon: { name: "event", size: 16, color: ACCENT_ICON },
      label: { name: "kpis.today" },
      value: { type: "number", path: "today", sx: KPI_VALUE_SX },
      sub: { name: "kpis.todaySub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "schedule", size: 16, color: MUTED_ICON },
      label: { name: "kpis.thisWeek" },
      value: { type: "number", path: "thisWeek", sx: KPI_VALUE_SX },
      sub: { name: "kpis.thisWeekSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "move-up", size: 16, color: MUTED_ICON },
      label: { name: "kpis.upcoming" },
      value: { type: "number", path: "upcoming", sx: KPI_VALUE_SX },
      sub: { name: "kpis.upcomingSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "check-circle", size: 16, color: MUTED_ICON },
      label: { name: "kpis.passed" },
      value: { type: "number", path: "passed", sx: KPI_VALUE_SX },
      sub: { name: "kpis.passedSub", sx: KPI_SUB_SX },
    },
  ],
};
