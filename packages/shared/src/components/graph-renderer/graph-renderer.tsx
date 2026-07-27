"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import type { ReactNode } from "react";
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
  const configFromId = useConfiguration<GraphRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { data, isLoading } = useFetch<GraphRow[]>(id, { data: seedRows<GraphRow>(dataProp) });
  const rows = Array.isArray(data) ? data : [];

  if (!config) return null;

  const series = buildSeries(config, rows, t);
  const options = buildOptions(config, rows, t);
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
      {config.header || toolbar ? (
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
