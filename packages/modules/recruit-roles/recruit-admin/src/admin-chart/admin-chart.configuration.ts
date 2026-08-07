import type { GraphRendererConfig } from "@recruit/shared";

export const AdminChartConfiguration: GraphRendererConfig = {
  type: "bar",
  header: { title: "title", subtitle: "subtitle" },
  categoryPath: "period",
  height: 260,
  legend: true,
  metrics: [
    {
      label: "metrics.revenue",
      valueType: "currency",
      series: [
        { label: "seriesA", path: "submitted", color: "var(--mui-palette-surface-primarySoftBg)" },
        { label: "seriesB", path: "booked", color: "var(--mui-palette-primary-main)" },
      ],
    },
    {
      label: "metrics.seats",
      valueType: "number",
      series: [
        { label: "seriesA", path: "submitted", color: "var(--mui-palette-surface-primarySoftBg)" },
        { label: "seriesB", path: "booked", color: "var(--mui-palette-primary-main)" },
      ],
    },
  ],
  valueType: "currency",
  series: [
    { label: "seriesA", path: "submitted", color: "var(--mui-palette-surface-primarySoftBg)" },
    { label: "seriesB", path: "booked", color: "var(--mui-palette-primary-main)" },
  ],
  emptyOverlay: {
    icon: "trending-up",
    title: "empty.title",
    description: "empty.description",
  },
};
