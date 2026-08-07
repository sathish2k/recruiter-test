"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import type { ReactNode } from "react";
import { seedRows } from "../../utils/seed-data";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";

/** One column of the board: the stage, how many sit in it, and the conversion
 * into it from the stage before (null on the first column). */
export interface StageFunnelRow {
  key: string;
  count: number;
  conversion?: number | null;
  [field: string]: unknown;
}

export interface StageFunnelRendererConfig {
  /** Card title. Translation key. */
  title: { name: string };
  /** Header link on the right ("View Pipeline →"). */
  link?: LinkRendererConfig;
  /** Stage labels resolve as `prefix + row.key` (default `"stage."`). */
  stageLabelPrefix?: string;
  /** Conversion pill text. Translation key, interpolated with the row. */
  conversionFormat: { name: string };
  /** Green end-to-end pill on the last column. Translation key, interpolated
   * with `{{overall}}` (first stage → last stage, whole percent). */
  overallFormat?: { name: string };
  /** Per-stage dot/bar colours, in column order. */
  colors?: string[];
  /** Amber note under the board. `name` is interpolated with the fetched
   * `meta`; `showKey` gates it on a truthy `meta` field. */
  insight?: { name: string; icon?: string; showKey?: string; link?: LinkRendererConfig };
  /** Column bar area height in px (design: 104). */
  barHeight?: number;
}

const DEFAULT_COLORS = [
  "var(--mui-palette-surface-infoFg)",
  "var(--mui-palette-surface-primarySoftFg)",
  "var(--mui-palette-surface-accentBright)",
  "var(--mui-palette-surface-warningFg)",
  "var(--mui-palette-surface-successFg)",
];

type T = (key: string, vars?: Record<string, unknown>) => string;

export function StageFunnelRenderer({
  id,
  config: configProp,
  data: dataProp,
}: {
  id: string;
  config?: StageFunnelRendererConfig;
  data?: StageFunnelRow[];
}) {
  const configFromId = useConfiguration<StageFunnelRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { t } = useTranslation(id) as { t: T };
  const { data, meta, isLoading } = useFetch<StageFunnelRow[]>(id, {
    data: seedRows<StageFunnelRow>(dataProp),
  });
  const rows = Array.isArray(data) ? data : [];

  if (!config) return null;
  if (isLoading) return <StageFunnelSkeleton config={config} />;
  if (rows.length === 0) return null;

  const prefix = config.stageLabelPrefix ?? "stage.";
  const colors = config.colors ?? DEFAULT_COLORS;
  const ceiling = Math.max(...rows.map((row) => Number(row.count) || 0), 1);
  const first = Number(rows[0]?.count) || 0;
  const last = Number(rows[rows.length - 1]?.count) || 0;
  const overall = first > 0 ? Math.round((last / first) * 100) : 0;
  const insightMeta = (meta ?? {}) as Record<string, unknown>;
  const showInsight =
    config.insight &&
    (!config.insight.showKey || Boolean(delve(insightMeta, config.insight.showKey)));

  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: "12px",
        }}
      >
        <Typography sx={{ fontSize: 14.5, fontWeight: 600 }}>{t(config.title.name)}</Typography>
        {config.link ? (
          <LinkRenderer config={config.link}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: 12,
                fontWeight: 600,
                color: "surface.primarySoftFg",
              }}
            >
              {config.link.label ? t(config.link.label.name) : null}
              <IconRenderer name="arrow-forward" size={14} color="inherit" />
            </Box>
          </LinkRenderer>
        ) : null}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${rows.length}, 1fr)`,
          borderBottom: "1px solid",
          borderColor: "surface.controlBorder",
          mt: "2px",
        }}
      >
        {rows.map((row, index) => (
          <FunnelColumn
            key={row.key}
            row={row}
            index={index}
            isLast={index === rows.length - 1}
            ceiling={ceiling}
            overall={overall}
            color={colors[index % colors.length] ?? ""}
            config={config}
            prefix={prefix}
            t={t}
          />
        ))}
      </Box>

      {showInsight && config.insight ? (
        <LinkRenderer config={config.insight.link ?? config.link ?? {}}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              fontSize: 11.5,
              color: "surface.warningSoftFg",
              mt: "13px",
            }}
          >
            <IconRenderer name={config.insight.icon ?? "warning"} size={13} color="inherit" />
            {t(config.insight.name, {
              ...insightMeta,
              stage: t(`${prefix}${insightMeta.bottleneckStage ?? ""}`),
            })}
            <IconRenderer name="arrow-forward" size={12} color="inherit" />
          </Box>
        </LinkRenderer>
      ) : null}
    </Card>
  );
}

/** Same column rhythm as the real board, so the card does not resize when the
 * counts land. */
function StageFunnelSkeleton({ config }: { config: StageFunnelRendererConfig }) {
  const heights = [58, 100, 46, 28, 14];
  return (
    <Card variant="base" sx={{ p: "18px 20px" }}>
      <Box
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: "12px" }}
      >
        <Skeleton variant="text" width={130} height={20} />
        <Skeleton variant="text" width={92} height={16} />
      </Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: `repeat(${heights.length}, 1fr)`,
          borderBottom: "1px solid",
          borderColor: "surface.border",
          mt: "2px",
        }}
      >
        {heights.map((height, index) => (
          <Box
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder board
            key={index}
            sx={{ display: "flex", flexDirection: "column", p: "5px 12px 0" }}
          >
            <Skeleton variant="text" width={34} height={26} />
            <Skeleton variant="text" width="70%" height={14} sx={{ mt: "6px" }} />
            <Box sx={{ minHeight: 23, mt: "8px" }}>
              <Skeleton variant="rounded" width={54} height={17} sx={{ borderRadius: "99px" }} />
            </Box>
            <Box
              sx={{
                height: config.barHeight ?? 104,
                display: "flex",
                alignItems: "flex-end",
                mt: "10px",
              }}
            >
              <Skeleton
                variant="rounded"
                height={`${height}%`}
                sx={{ width: "100%", borderRadius: "8px 8px 0 0" }}
              />
            </Box>
          </Box>
        ))}
      </Box>
    </Card>
  );
}

function FunnelColumn({
  row,
  index,
  isLast,
  ceiling,
  overall,
  color,
  config,
  prefix,
  t,
}: {
  row: StageFunnelRow;
  index: number;
  isLast: boolean;
  ceiling: number;
  overall: number;
  color: string;
  config: StageFunnelRendererConfig;
  prefix: string;
  t: T;
}) {
  const count = Number(row.count) || 0;
  const column = (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: 0,
        height: "100%",
        p: "5px 12px 0",
        borderLeft: index === 0 ? "none" : "1px dashed",
        borderColor: "surface.divider",
        borderRadius: "10px 10px 0 0",
        color: "text.primary",
        "&:hover": { bgcolor: "surface.hoverSubtle" },
      }}
    >
      <Typography sx={{ fontSize: 21, fontWeight: 700, lineHeight: 1, letterSpacing: "-.01em" }}>
        {count}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
          fontSize: 10.5,
          color: "text.secondary",
          mt: "6px",
          minWidth: 0,
        }}
      >
        <Box sx={{ width: 7, height: 7, borderRadius: "99px", background: color, flex: "none" }} />
        <Box component="span" sx={{ minWidth: 0 }}>
          {t(`${prefix}${row.key}`)}
        </Box>
      </Box>

      <Box sx={{ minHeight: 23, mt: "8px" }}>
        {isLast && config.overallFormat ? (
          <FunnelPill tone="success">{t(config.overallFormat.name, { overall })}</FunnelPill>
        ) : row.conversion != null ? (
          <FunnelPill>
            {t(config.conversionFormat.name, { ...row })}
            <IconRenderer name="arrow-forward" size={10} color="inherit" />
          </FunnelPill>
        ) : null}
      </Box>

      <Box
        sx={{
          height: config.barHeight ?? 104,
          display: "flex",
          alignItems: "flex-end",
          mt: "10px",
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: `${(count / ceiling) * 100}%`,
            minHeight: 5,
            background: color,
            borderRadius: "8px 8px 0 0",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,.28)",
          }}
        />
      </Box>
    </Box>
  );

  if (!config.link) return column;
  return (
    <LinkRenderer config={{ ...config.link, sx: { display: "block", ...config.link.sx } }}>
      {column}
    </LinkRenderer>
  );
}

function FunnelPill({ tone, children }: { tone?: "success"; children: ReactNode }) {
  return (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: 10,
        fontWeight: 600,
        p: "2.5px 8px",
        borderRadius: "99px",
        whiteSpace: "nowrap",
        border: "1px solid",
        ...(tone === "success"
          ? {
              color: "surface.successFg",
              bgcolor: "surface.successSoftBg",
              borderColor: "surface.successSoftBorder",
            }
          : {
              color: "text.secondary",
              bgcolor: "surface.hoverSubtle",
              borderColor: "surface.divider",
            }),
      }}
    >
      {children}
    </Box>
  );
}
