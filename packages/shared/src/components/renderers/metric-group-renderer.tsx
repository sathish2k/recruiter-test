"use client";

import Box from "@mui/material/Box";
import { useTranslation } from "@recruit/sdk";
import delve from "dlv";

export interface MetricGroupItem {
  /** Data path for the count. */
  path: string;
  /** Translation key for the caption under the count. */
  label: string;
  /** Dot colour — a palette token or literal. */
  color?: string;
  /** Applied to the count when it is non-zero (the design reddens Overdue). */
  valueColor?: string;
}

export interface MetricGroupRendererConfig {
  type: "metric-group";
  /** Component id the labels resolve against. */
  id: string;
  metrics: MetricGroupItem[];
}

/** A row of dot + count + caption columns — the design's "SLA status" trio. */
export function MetricGroupRenderer({
  config,
  data = {},
}: {
  config: MetricGroupRendererConfig;
  data?: Record<string, unknown>;
}) {
  const { t } = useTranslation(config.id);
  return (
    <Box sx={{ display: "flex", gap: "14px" }}>
      {config.metrics.map((metric) => {
        const value = Number(delve(data, metric.path) ?? 0);
        return (
          <Box key={metric.path} sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "999px",
                  background: metric.color ?? "var(--mui-palette-surface-textDisabled)",
                  flex: "none",
                }}
              />
              <Box
                component="b"
                sx={{
                  fontSize: 17,
                  ...(metric.valueColor && value > 0 ? { color: metric.valueColor } : {}),
                }}
              >
                {value}
              </Box>
            </Box>
            <Box sx={{ fontSize: 10.5, color: "text.disabled", mt: "2px" }}>{t(metric.label)}</Box>
          </Box>
        );
      })}
    </Box>
  );
}
