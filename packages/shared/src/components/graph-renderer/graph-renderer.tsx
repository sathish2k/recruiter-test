"use client";

import Box from "@mui/material/Box";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import type { ReactNode } from "react";
import { Chart } from "./chart";
import { buildOptions, buildSeries } from "./graph-renderer.helpers";
import type { GraphRendererConfig, GraphRow } from "./graph-renderer.types";

// A config-driven chart. `id` resolves config, translations and data. Pass
// `data` to skip the fetch (the GraphFilterRenderer feeds it filtered/paged
// rows). `toolbar` renders on the right of the header (filters, pagination).
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
  const { data } = useFetch<GraphRow[]>(id, { data: dataProp });
  const rows = Array.isArray(data) ? data : [];

  if (!config) return null;

  const series = buildSeries(config, rows, t);
  const options = buildOptions(config, rows);

  return (
    <Box
      sx={{
        background: "#1C1C1B",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: "16px",
        p: "18px 20px",
      }}
    >
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
              <Box sx={{ fontSize: 15, fontWeight: 600, color: "#ECEAE7" }}>
                {t(config.header.title)}
              </Box>
            ) : null}
            {config.header?.subtitle ? (
              <Box sx={{ fontSize: 12.5, color: "#7C7972", mt: "2px" }}>
                {t(config.header.subtitle)}
              </Box>
            ) : null}
          </Box>
          {toolbar ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {toolbar}
            </Box>
          ) : null}
        </Box>
      ) : null}
      <Chart
        type={config.type}
        series={series}
        options={options}
        height={config.height ?? 300}
      />
    </Box>
  );
}
