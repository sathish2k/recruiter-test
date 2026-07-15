import type {
  StatCardRendererConfig,
  TableRendererConfig,
} from "@recruit/shared";

export type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";

export interface AiScoreItem {
  icon: string;
  label: string;
}

export interface AiScreeningConfig {
  reportRouteId: string;
  jobRouteId: string;
  kpiCards: StatCardRendererConfig[];
  verdictStyles: Record<string, BadgeColor>;
  scoreItems: AiScoreItem[];
  recent: TableRendererConfig;
}

const ACCENT_ICON = "#FF9D57";
const MUTED_ICON = "#7C7972";
const KPI_VALUE_SX = { fontSize: 27 };
const KPI_SUB_SX = { fontSize: 11.5, color: "text.disabled" };

const verdictStyles: Record<string, BadgeColor> = {
  Strong: "success",
  Consider: "warning",
  Below: "default",
};

const recent: TableRendererConfig = {
  header: { title: "recent.title", subtitle: "recent.subtitle" },
  emptyLabel: "recent.empty",
  columns: [
    {
      label: { name: "recent.columns.candidate" },
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
      label: { name: "recent.columns.roleClient" },
      value: {
        type: "text",
        path: "roleClient",
        sx: { color: "text.secondary" },
      },
    },
    {
      label: { name: "recent.columns.score" },
      width: 160,
      value: { type: "score-bar", path: "score", suffix: "%" },
    },
    {
      label: { name: "recent.columns.verdict" },
      value: {
        type: "status",
        path: "verdict",
        variant: "soft",
        labels: {
          Strong: "verdicts.Strong",
          Consider: "verdicts.Consider",
          Below: "verdicts.Below",
        },
        colors: verdictStyles,
      },
    },
    {
      label: { name: "recent.columns.when" },
      value: { type: "text", path: "when", sx: { color: "text.secondary" } },
    },
    {
      label: { name: "recent.columns.report" },
      align: "right",
      value: {
        type: "link",
        id: "Recruit.AiScreening.Component",
        routeId: "Recruit.CandidateDetail.Route",
        params: { id: { type: "dynamic", path: "id" } },
        label: { name: "recent.report" },
        color: "primary",
        sx: { fontSize: 12.5, fontWeight: 600 },
      },
    },
  ],
};

export const AiScreeningConfiguration: AiScreeningConfig = {
  reportRouteId: "Recruit.CandidateDetail.Route",
  jobRouteId: "Recruit.JobDetail.Route",
  recent,
  kpiCards: [
    {
      variant: "accent",
      icon: { name: "sparkle", size: 16, color: ACCENT_ICON },
      label: { name: "kpis.cvsScoredToday" },
      value: { type: "number", path: "cvsScoredToday", sx: KPI_VALUE_SX },
      sub: { name: "kpis.cvsScoredTodaySub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "insights", size: 16, color: MUTED_ICON },
      label: { name: "kpis.avgMatch" },
      value: {
        type: "number",
        path: "avgMatch",
        suffix: "%",
        sx: KPI_VALUE_SX,
      },
      sub: { name: "kpis.avgMatchSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "move-up", size: 16, color: MUTED_ICON },
      label: { name: "kpis.aboveThreshold" },
      value: { type: "number", path: "aboveThreshold", sx: KPI_VALUE_SX },
      sub: { name: "kpis.aboveThresholdSub", sx: KPI_SUB_SX },
    },
    {
      icon: { name: "schedule", size: 16, color: MUTED_ICON },
      label: { name: "kpis.timeSaved" },
      value: {
        type: "text",
        path: "timeSaved",
        placeholder: "—",
        sx: KPI_VALUE_SX,
      },
      sub: { name: "kpis.timeSavedSub", sx: KPI_SUB_SX },
    },
  ],
  verdictStyles,
  scoreItems: [
    { icon: "checklist", label: "scores.items.skills" },
    { icon: "work-history", label: "scores.items.experience" },
    { icon: "domain", label: "scores.items.domain" },
    { icon: "payments", label: "scores.items.compensation" },
  ],
};
