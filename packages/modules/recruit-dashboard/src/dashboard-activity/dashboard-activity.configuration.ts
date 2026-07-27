import type { BarChartRendererConfig } from "@recruit/shared";

export const DashboardActivityConfiguration: BarChartRendererConfig = {
  label: { name: "label" },
  categoryPath: "date",
  categoryDateOptions: { day: "numeric" },
  tabs: [
    { path: "submissions", label: "tabs.submissions" },
    { path: "interviews", label: "tabs.interviews" },
    { path: "placements", label: "tabs.placements" },
    { path: "invites", label: "tabs.invites" },
  ],
  period: {
    key: "days",
    options: [
      { value: "7", label: "periods.7" },
      { value: "14", label: "periods.14" },
      { value: "30", label: "periods.30" },
    ],
  },
  peak: { name: "peak" },
  valueToggle: true,
  height: 190,
};
