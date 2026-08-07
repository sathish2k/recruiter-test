"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { useColorMode } from "@recruit/ui";
import { type ReactNode, useState } from "react";
import { seedRows } from "../../utils/seed-data";
import { EmptyStateRenderer } from "../renderers";
import { Chart } from "./chart";
import { buildOptions, buildSeries } from "./graph-renderer.helpers";
import type { GraphRendererConfig, GraphRow } from "./graph-renderer.types";

export function GraphRenderer({
  id,
  config: configProp,
  data: dataProp,
  toolbar,
}: {
  id: string;
  config?: GraphRendererConfig;
  data?: GraphRow[];
  toolbar?: ReactNode;
}) {
  const { t } = useTranslation(id);
  const [metric, setMetric] = useState(0);
  const { mode } = useColorMode();
  const configFromId = useConfiguration<GraphRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { data, isLoading } = useFetch<GraphRow[]>(id, { data: seedRows<GraphRow>(dataProp) });
  const rows = Array.isArray(data) ? data : [];

  if (!config) return null;

  // A picked metric replaces the series the chart plots; everything else about
  // the card — axis, empty state, height — is unchanged.
  const metrics = config.metrics ?? [];
  const picked = metrics[metric];
  const active = picked
    ? { ...config, series: picked.series, valueType: picked.valueType ?? config.valueType }
    : config;

  const series = buildSeries(active, rows, t);
  const options = buildOptions(active, rows, t, mode);
  const overlay =
    rows.length === 0 && config.emptyOverlay ? (
      <EmptyStateRenderer
        config={{
          icon: config.emptyOverlay.icon,
          title: config.emptyOverlay.title,
          description: config.emptyOverlay.description,
          tone: "neutral",
          compact: true,
        }}
        t={t}
      />
    ) : undefined;

  return (
    <Card variant="base">
      {config.header || toolbar || metrics.length > 1 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "12px",
            mb: "6px",
          }}
        >
          <Box>
            {config.header?.title ? (
              <Box sx={{ fontSize: 15, fontWeight: 600 }}>{t(config.header.title)}</Box>
            ) : null}
            {config.header?.subtitle ? (
              <Box sx={{ fontSize: 12.5, color: "text.disabled", mt: "2px" }}>
                {t(config.header.subtitle)}
              </Box>
            ) : null}
          </Box>
          {metrics.length > 1 ? (
            <Box
              sx={{
                display: "flex",
                gap: "3px",
                p: "3px",
                borderRadius: "9px",
                bgcolor: "surface.inset",
                flex: "none",
              }}
            >
              {metrics.map((entry, index) => (
                <Box
                  component="button"
                  type="button"
                  key={entry.label}
                  onClick={() => setMetric(index)}
                  aria-pressed={index === metric}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    height: 30,
                    px: "11px",
                    border: "none",
                    borderRadius: "7px",
                    bgcolor: index === metric ? "background.paper" : "transparent",
                    color: index === metric ? "text.primary" : "text.secondary",
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "var(--recruit-motion-state)",
                  }}
                >
                  {t(entry.label)}
                </Box>
              ))}
            </Box>
          ) : null}
          {toolbar ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>{toolbar}</Box>
          ) : null}
        </Box>
      ) : null}
      {isLoading ? (
        <Skeleton variant="rounded" height={config.height ?? 300} sx={{ borderRadius: "12px" }} />
      ) : (
        <Chart
          type={config.type}
          series={series}
          options={options}
          height={config.height ?? 300}
          overlay={overlay}
        />
      )}
    </Card>
  );
}
