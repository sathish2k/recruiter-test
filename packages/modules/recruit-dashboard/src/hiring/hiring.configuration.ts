export interface HiringMetric {
  /** Path into each point for this metric's value. */
  key: string;
  /** Tab label translation key. */
  label: string;
  color: string;
}

export interface HiringConfig {
  header?: { title?: string };
  /** Path into each point for the x-axis label. */
  categoryPath?: string;
  metrics: HiringMetric[];
  /** Period pill options (label translation keys) — cycled on click. */
  periods: { value: string; label: string }[];
  height?: number;
}

export const HiringConfiguration: HiringConfig = {
  header: { title: "title" },
  categoryPath: "label",
  metrics: [
    { key: "applications", label: "metrics.applications", color: "#FF8A3C" },
    { key: "interviews", label: "metrics.interviews", color: "#D98E5A" },
    { key: "hires", label: "metrics.hires", color: "#8FD6AC" },
  ],
  periods: [
    { value: "weekly", label: "periods.weekly" },
    { value: "monthly", label: "periods.monthly" },
  ],
  height: 240,
};
