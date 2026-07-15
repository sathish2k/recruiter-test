export type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "default";

export interface AiScreeningKpi {
  key: "cvsScoredToday" | "avgMatch" | "aboveThreshold" | "timeSaved";
  label: string;
  path: string;
  suffix?: string;
  accent?: boolean;
  icon: string;
}

export interface AiScoreItem {
  icon: string;
  label: string;
}

export interface AiScreeningConfig {
  reportRouteId: string;
  jobRouteId: string;
  kpis: AiScreeningKpi[];
  verdictStyles: Record<string, BadgeColor>;
  scoreItems: AiScoreItem[];
}

export const AiScreeningConfiguration: AiScreeningConfig = {
  reportRouteId: "Recruit.CandidateDetail.Route",
  jobRouteId: "Recruit.JobDetail.Route",
  kpis: [
    {
      key: "cvsScoredToday",
      label: "kpis.cvsScoredToday",
      path: "kpis.cvsScoredToday",
      accent: true,
      icon: "sparkle",
    },
    {
      key: "avgMatch",
      label: "kpis.avgMatch",
      path: "kpis.avgMatch",
      suffix: "%",
      icon: "insights",
    },
    {
      key: "aboveThreshold",
      label: "kpis.aboveThreshold",
      path: "kpis.aboveThreshold",
      icon: "move-up",
    },
    {
      key: "timeSaved",
      label: "kpis.timeSaved",
      path: "kpis.timeSaved",
      icon: "schedule",
    },
  ],
  verdictStyles: {
    Strong: "success",
    Consider: "warning",
    Below: "default",
  },
  scoreItems: [
    { icon: "checklist", label: "scores.items.skills" },
    { icon: "work-history", label: "scores.items.experience" },
    { icon: "domain", label: "scores.items.domain" },
    { icon: "payments", label: "scores.items.compensation" },
  ],
};
