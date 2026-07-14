"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import {
  GenericRenderer,
  type GenericRendererConfig,
} from "./generic-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";

export interface StatCardRendererConfig {
  /** `name` is a translation key resolved via useTranslation(id). */
  label: { name: string };
  /** The value's renderer config (e.g. { type: "number", path: "openRoles" }). */
  value: GenericRendererConfig;
  /** Delta text: `name` is a translation key (may contain `{value}`); `value`
   * is a data path interpolated into it; `color` overrides the text color.
   * `variant: "pill"` renders it as a colored pill on the right of the value. */
  delta?: {
    name: string;
    value?: string;
    color?: string;
    variant?: "text" | "pill";
  };
  /** Wrap the card in a link — a link-renderer config (routeId + queryParams to
   * pass filters to the target screen). Renders the tile as a clickable link. */
  link?: LinkRendererConfig;
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
  const pill = config.delta?.variant === "pill";
  const clickable = Boolean(config.link);
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

  const deltaColor = config.delta?.color ?? DELTA_COLOR;

  const card = (
    <Card
      variant={clickable ? "interactive" : "base"}
      sx={{
        color: "#ECEAE7",
        borderRadius: "14px",
        padding: pill ? "18px 20px" : "16px 18px",
      }}
    >
      <Typography
        sx={{
          fontSize: pill ? 13 : 12.5,
          color: "#9A968E",
          mb: pill ? "10px" : "8px",
        }}
      >
        {config.label ? t(config.label.name) : ""}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: pill ? "center" : "baseline",
          justifyContent: pill ? "space-between" : "flex-start",
          gap: "9px",
        }}
      >
        {config.value ? (
          <GenericRenderer config={valueConfig} data={data} />
        ) : null}
        {deltaText ? (
          pill ? (
            <Chip
              variant="soft"
              color="primary"
              size="small"
              label={deltaText}
            />
          ) : (
            <Box
              component="span"
              sx={{ fontSize: 12, fontWeight: 600, color: deltaColor }}
            >
              {deltaText}
            </Box>
          )
        ) : null}
      </Box>
    </Card>
  );

  if (config.link) {
    return (
      <LinkRenderer
        config={{ ...config.link, sx: { display: "block", ...config.link.sx } }}
      >
        {card}
      </LinkRenderer>
    );
  }
  return card;
}

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
