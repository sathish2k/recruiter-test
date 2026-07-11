"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import {
  GenericRenderer,
  type GenericRendererConfig,
} from "./generic-renderer";

export interface StatCardRendererConfig {
  /** `name` is a translation key resolved via useTranslation(id). */
  label: { name: string };
  /** The value's renderer config (e.g. { type: "number", path: "openRoles" }). */
  value: GenericRendererConfig;
  /** Delta text: `name` is a translation key (may contain `{value}`); `value`
   * is a data path interpolated into it; `color` overrides the text color. */
  delta?: { name: string; value?: string; color?: string };
}

const DELTA_COLOR = "#F0B27C";

const VALUE_SX = { fontSize: 25, fontWeight: 700, letterSpacing: "-.01em" };

type T = (key: string, fallback?: string) => string;

function StatCard({
  config,
  data,
  t,
}: {
  config: StatCardRendererConfig;
  data: Record<string, unknown>;
  t: T;
}) {
  const overrideSx = (config.value as { sx?: Record<string, unknown> })?.sx;
  const valueConfig = {
    ...config.value,
    sx: { ...VALUE_SX, ...(overrideSx ?? {}) },
  } as GenericRendererConfig;

  let deltaText = "";
  if (config.delta) {
    const template = t(config.delta.name);
    const dynamic =
      config.delta.value != null ? delve(data, config.delta.value) : undefined;
    deltaText =
      dynamic == null
        ? template
        : template.includes("{value}")
          ? template.replace(/\{value\}/g, String(dynamic))
          : `${template} ${dynamic}`;
  }

  return (
    <Box
      sx={{
        background: "#1C1C1B",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: "14px",
        p: "16px 18px",
        color: "#ECEAE7",
      }}
    >
      <Typography sx={{ fontSize: 12.5, color: "#9A968E", mb: "8px" }}>
        {config.label ? t(config.label.name) : ""}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "baseline",
          gap: "9px",
        }}
      >
        {config.value ? (
          <GenericRenderer config={valueConfig} data={data} />
        ) : null}
        {deltaText ? (
          <Box
            component="span"
            sx={{
              fontSize: 12,
              fontWeight: 600,
              color: config.delta?.color ?? DELTA_COLOR,
            }}
          >
            {deltaText}
          </Box>
        ) : null}
      </Box>
    </Box>
  );
}

// Renders one or many stat cards. Config comes from the prop (single or array)
// or the component's registered configuration by id. Looping is driven by the
// config array, not by data. Fetches by id unless `data` is provided.
export function StatCardRenderer({
  id,
  config: configProp,
  data: dataProp,
  gridTemplateColumns,
  gap = "14px",
}: {
  id: string;
  config?: StatCardRendererConfig | StatCardRendererConfig[];
  data?: Record<string, unknown>;
  /** When set, the cards are wrapped in a grid with this template. */
  gridTemplateColumns?: string;
  gap?: string | number;
}) {
  const configFromId = useConfiguration<
    StatCardRendererConfig | StatCardRendererConfig[]
  >(id);
  const source = configProp ?? configFromId;
  const configs = Array.isArray(source) ? source : [source];
  const { t } = useTranslation(id);
  const { data: resolved } = useFetch<Record<string, unknown>>(id, {
    data: dataProp,
  });
  const data = resolved ?? {};

  const cards = configs.map((config, i) => (
    <StatCard
      key={config?.label?.name ?? i}
      config={config}
      data={data}
      t={t}
    />
  ));

  // One card → render it plain. Multiple → auto-grid (one column per card by
  // default) unless the caller overrides gridTemplateColumns.
  if (configs.length > 1 || gridTemplateColumns) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns:
            gridTemplateColumns ?? `repeat(${configs.length}, 1fr)`,
          gap,
        }}
      >
        {cards}
      </Box>
    );
  }
  return <>{cards}</>;
}
