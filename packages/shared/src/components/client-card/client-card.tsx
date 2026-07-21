"use client";

// Deliberate non-theme colours: the avatar swatches below are a fixed
// rotation of hues used to tell clients apart at a glance — they're identity,
// not chrome, so they don't follow the colour scheme.
import ArrowForwardRounded from "@mui/icons-material/ArrowForwardRounded";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import {
  GenericRenderer,
  type GenericRendererConfig,
  LinkRenderer,
  type LinkRendererConfig,
  StaticTranslationRenderer,
  type StaticTranslationRendererConfig,
  StatusRenderer,
  type StatusRendererConfig,
  TextRenderer,
  type TextRendererConfig,
} from "../renderers";

export interface ClientCardData {
  id: string;
  name: string;
  industry: string;
  manager: string;
  status: string;
  openRoles: number;
  hires: number;
  sourced: number;
  screened: number;
  interviewing: number;
  pipeline: number;
  activity: string;
}

/** A metric cell: big number (value renderer) over a translated label. */
export interface ClientMetricConfig {
  label: { name: string };
  value: GenericRendererConfig;
}

/** Static-translation config (id injected by ClientCard) plus a swatch color. */
type PipelineStatConfig = Omit<StaticTranslationRendererConfig, "id"> & {
  swatch?: string;
};

export interface ClientCardConfig {
  /** String-renderer config for the client name. */
  name?: TextRendererConfig;
  /** Status-renderer config for the status chip. */
  status?: StatusRendererConfig;
  /** Metric row (open roles, in pipeline, hires). */
  metrics?: ClientMetricConfig[];
  /** Static-translation configs for the pipeline breakdown (sourced, …). */
  pipeline?: PipelineStatConfig[];
  /** Link-renderer configs for the card's footer actions. */
  actions?: LinkRendererConfig[];
}

const DEFAULT_NAME: TextRendererConfig = {
  type: "string",
  path: "name",
  sx: { fontSize: 15.5, fontWeight: 700 },
};

const DEFAULT_STATUS: StatusRendererConfig = {
  type: "status",
  path: "status",
  labels: { hiring: "status.hiring", paused: "status.paused" },
  colors: { hiring: "success", paused: "default" },
  dot: true,
  sx: {
    fontSize: 11.5,
    fontWeight: 600,
    height: 24,
    "& .MuiChip-label": { px: "11px" },
  },
};

const DEFAULT_METRICS: ClientMetricConfig[] = [
  {
    label: { name: "openRoles" },
    value: { type: "number", path: "openRoles" },
  },
  {
    label: { name: "inPipeline" },
    value: { type: "number", path: "pipeline" },
  },
  {
    label: { name: "hires" },
    value: { type: "number", path: "hires", sx: { color: "surface.accentBright" } },
  },
];

const DEFAULT_PIPELINE: PipelineStatConfig[] = [
  {
    type: "static-translation",
    key: "sourced",
    value: "sourced",
    swatch: "#3A3A38",
    sx: { fontSize: 11.5 },
  },
  {
    type: "static-translation",
    key: "screened",
    value: "screened",
    swatch: "#B9805A",
    sx: { fontSize: 11.5 },
  },
  {
    type: "static-translation",
    key: "interviewing",
    value: "interviewing",
    swatch: "var(--mui-palette-primary-main)",
    sx: { fontSize: 11.5 },
  },
];

const LOGO_PALETTE = [
  { bg: "#3A4A5B", fg: "#CFE3F5" },
  { bg: "#4A3A5B", fg: "#E3CFF5" },
  { bg: "#3A5B4A", fg: "#CFF5E0" },
  { bg: "#5B3A3A", fg: "#F5CFCF" },
  { bg: "#5B4A3A", fg: "#FFD9BC" },
  { bg: "#4A5B3A", fg: "#E0F5CF" },
];

const METRIC_VALUE_SX = {
  fontSize: 21,
  fontWeight: 700,
  letterSpacing: "-.01em",
};

export function ClientCard({
  id,
  client,
  index = 0,
  config,
}: {
  id: string;
  client: ClientCardData;
  index?: number;
  config?: ClientCardConfig;
}) {
  const { t } = useTranslation(id);
  const logo = LOGO_PALETTE[index % LOGO_PALETTE.length];
  const total = client.sourced + client.screened + client.interviewing || 1;
  const record = client as unknown as Record<string, unknown>;

  const nameConfig = config?.name ?? DEFAULT_NAME;
  const statusSource = config?.status ?? DEFAULT_STATUS;
  const statusConfig: StatusRendererConfig = {
    ...statusSource,
    labels: Object.fromEntries(
      Object.entries(statusSource.labels ?? {}).map(([k, v]) => [k, t(v)]),
    ),
  };
  const metrics = config?.metrics ?? DEFAULT_METRICS;
  const pipeline = (config?.pipeline ?? DEFAULT_PIPELINE).map((p) => ({
    ...p,
    id,
  }));
  const actions = (config?.actions ?? []).map((action) => ({ ...action, id }));

  return (
    <Card
      variant="interactive"
      sx={{
        p: "22px",
        display: "flex",
        flexDirection: "column",
        gap: "18px",
        borderRadius: "18px",
        background:
          "linear-gradient(180deg,rgba(255,255,255,.025),rgba(255,255,255,0) 60%),var(--mui-palette-background-paper)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "13px" }}>
        <Avatar
          variant="rounded"
          sx={{
            width: 46,
            height: 46,
            borderRadius: "13px",
            bgcolor: logo.bg,
            color: logo.fg,
            fontSize: 18,
            fontWeight: 700,
          }}
        >
          {client.name.charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <TextRenderer config={nameConfig} data={record} />
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
            {client.industry} · {client.manager}
          </Typography>
        </Box>
        <StatusRenderer config={statusConfig} data={record} />
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${metrics.length}, 1fr)`,
        }}
      >
        {metrics.map((metric, i) => {
          const overrideSx = (metric.value as { sx?: Record<string, unknown> })?.sx;
          const valueConfig = {
            ...metric.value,
            sx: { ...METRIC_VALUE_SX, ...(overrideSx ?? {}) },
          } as GenericRendererConfig;
          const last = i === metrics.length - 1;
          return (
            <Box
              key={metric.label.name}
              sx={{
                borderRight: last ? "none" : "1px solid var(--mui-palette-surface-tint)",
                pl: i === 0 ? 0 : "14px",
                pr: last ? 0 : "14px",
              }}
            >
              <GenericRenderer config={valueConfig} data={record} />
              <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "2px" }}>
                {t(metric.label.name)}
              </Typography>
            </Box>
          );
        })}
      </Box>

      <Box>
        <Box
          sx={{
            display: "flex",
            gap: "3px",
            height: 8,
            borderRadius: "999px",
            overflow: "hidden",
            background: "#242422",
          }}
        >
          <Box
            sx={{
              width: `${(client.sourced / total) * 100}%`,
              background: "#3A3A38",
            }}
          />
          <Box
            sx={{
              width: `${(client.screened / total) * 100}%`,
              background: "#B9805A",
            }}
          />
          <Box
            sx={{
              width: `${(client.interviewing / total) * 100}%`,
              background:
                "linear-gradient(90deg,var(--mui-palette-primary-light),var(--mui-palette-primary-dark))",
            }}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            mt: "9px",
            fontSize: 11.5,
            color: "text.secondary",
            flexWrap: "wrap",
          }}
        >
          {pipeline.map((stat) => (
            <Box
              key={stat.key}
              component="span"
              sx={{ display: "flex", alignItems: "center", gap: "6px" }}
            >
              {stat.swatch ? (
                <Box
                  component="span"
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "2px",
                    background: stat.swatch,
                  }}
                />
              ) : null}
              <StaticTranslationRenderer config={stat} data={record} />
            </Box>
          ))}
        </Box>
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid var(--mui-palette-surface-hover)",
          pt: "14px",
        }}
      >
        <Typography sx={{ fontSize: 12, color: "text.disabled" }}>{client.activity}</Typography>
        {actions.length ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: 12.5,
              fontWeight: 600,
              color: "surface.primarySoftFg",
              "&:hover": { color: "primary.light" },
            }}
          >
            {actions.map((action, i) => (
              <LinkRenderer
                key={action.routeId ?? action.href ?? i}
                config={{ color: "inherit", underline: "none", ...action }}
                data={record}
              />
            ))}
            <ArrowForwardRounded sx={{ fontSize: 14 }} />
          </Box>
        ) : null}
      </Box>
    </Card>
  );
}
