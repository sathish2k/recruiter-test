import type { CardRendererConfig } from "@recruit/shared";

const ID = "Recruit.DashboardSla.Component";

export const DashboardSlaConfiguration: CardRendererConfig = {
  variant: "compact",
  header: { kicker: { name: "title", variant: "title" } },
  body: [
    {
      value: {
        type: "metric-group",
        id: ID,
        metrics: [
          {
            path: "onTrack",
            label: "metrics.onTrack",
            color: "var(--mui-palette-success-main)",
          },
          {
            path: "dueToday",
            label: "metrics.dueToday",
            color: "var(--mui-palette-surface-warningSoftFg)",
          },
          {
            path: "overdue",
            label: "metrics.overdue",
            color: "var(--mui-palette-error-main)",
            valueColor: "var(--mui-palette-error-light)",
          },
        ],
      },
    },
  ],
  link: {
    id: ID,
    linkType: "route",
    routeId: "Recruit.Jobs.Route",
    target: "_self",
    underline: "none",
    color: "inherit",
  },
};
