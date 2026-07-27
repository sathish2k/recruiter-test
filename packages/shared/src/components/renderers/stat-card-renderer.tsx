"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card, { type CardProps } from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography, { type TypographyProps } from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { useState } from "react";
import { seedRecord } from "../../utils/seed-data";
import { useToast } from "../toast/toast";
import { GenericRenderer, type GenericRendererConfig } from "./generic-renderer";
import { IconRenderer } from "./icon-renderer";
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
  /** Grid columns this card occupies in the row (default 1) — how the config
   * allocates width across the tiles. Ignored below `md`, where cards stack. */
  span?: number;
  /** Theme Card variant override (e.g. "accent" for the gradient hero card).
   * Defaults to "interactive" when `link` is set, else "base". */
  variant?: CardProps["variant"];
  /** Leading icon rendered top-right in the card header row. */
  icon?: { name: string; size?: number; color?: string };
  /** Sub-metric line below the value. `name` is a translation key interpolated
   * against the full data row (i18next `{{token}}` style). */
  sub?: { name: string; sx?: TypographyProps["sx"] };
  /** First-run treatment: when the resolved value is 0, the value renders in a
   * muted color and this plain sub string replaces the delta/trend. */
  zeroSub?: { name: string };
  /** Renders a target progress bar under the value. `targetPath` is the data
   * path for the target; the bar fills to value/target. `valuePath` overrides
   * the numerator path (defaults to the value config's `path`) so the big value
   * can stay a formatted GenericRenderer while the bar reads a raw number.
   * `color`/`trackColor` override the fill/track. */
  progress?: {
    targetPath: string;
    valuePath?: string;
    color?: string;
    trackColor?: string;
  };
  /** Renders a button that optimistically increments the value and toasts. */
  action?: {
    label: { name: string };
    icon?: string;
    toast?: { title: string; sub: string };
  };
  /** Wrap the card in a link — a link-renderer config (routeId + queryParams to
   * pass filters to the target screen). Renders the tile as a clickable link. */
  link?: LinkRendererConfig;
}

const DELTA_COLOR = "var(--mui-palette-surface-primarySoftFg)";

const VALUE_SX = { fontSize: 27, fontWeight: 700, letterSpacing: "-.01em" };

const ICON_COLOR = "var(--mui-palette-surface-primarySoftFg)";
const ICON_SIZE = 17;

type T = (key: string, vars?: string | Record<string, unknown>) => string;

// ponytail: the accent "Invites sent today" card is the only stat with a live
// optimistic counter + toast, so `progress`/`action` live here rather than a
// bespoke module component (keeps the whole 4-card grid on one renderer).
function ProgressStatBody({
  config,
  data,
  t,
}: {
  config: StatCardRendererConfig;
  data: Record<string, unknown>;
  t: T;
}) {
  const [logged, setLogged] = useState(0);
  const hasAction = Boolean(config.action);
  const overrideSx = (config.value as { sx?: Record<string, unknown> })?.sx;
  const numeratorPath =
    config.progress?.valuePath ?? (config.value as { path?: string }).path ?? "";
  const base = Number(delve(data, numeratorPath) ?? 0);
  const value = base + logged;
  const target = config.progress ? Number(delve(data, config.progress.targetPath) ?? 0) : 0;
  const pct = target > 0 ? Math.round((value / target) * 100) : 0;
  const valueConfig = {
    ...config.value,
    sx: { ...VALUE_SX, ...(overrideSx ?? {}) },
  } as GenericRendererConfig;

  return (
    <>
      {hasAction ? (
        <Typography sx={{ ...VALUE_SX, ...(overrideSx ?? {}) }}>{value}</Typography>
      ) : (
        <GenericRenderer config={valueConfig} data={data} />
      )}
      {config.sub ? (
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "8px" }}>
          {t(config.sub.name, { ...data, pct })}
        </Typography>
      ) : null}
      <Box
        sx={{
          height: 6,
          borderRadius: "999px",
          background: config.progress?.trackColor ?? "var(--mui-palette-surface-track)",
          overflow: "hidden",
          mt: "10px",
        }}
      >
        <Box
          sx={{
            width: `${Math.min(pct, 100)}%`,
            height: "100%",
            borderRadius: "999px",
            background: config.progress?.color ?? "var(--mui-palette-text-primary)",
          }}
        />
      </Box>
      {config.action ? (
        <StatAction config={config} t={t} onLog={() => setLogged((c) => c + 1)} />
      ) : null}
    </>
  );
}

function StatAction({
  config,
  t,
  onLog,
}: {
  config: StatCardRendererConfig;
  t: T;
  onLog: () => void;
}) {
  const { show } = useToast();
  const action = config.action;
  if (!action) return null;
  return (
    <Button
      variant="contained"
      color="secondary"
      onClick={() => {
        onLog();
        if (action.toast) {
          show(t(action.toast.title), t(action.toast.sub));
        }
      }}
      startIcon={action.icon ? <IconRenderer name={action.icon} size={15} /> : undefined}
      sx={{ fontSize: 12, mt: "14px" }}
    >
      {t(action.label.name)}
    </Button>
  );
}

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
  const kpiMode = Boolean(config.icon || config.progress);
  const variant = config.variant ?? (clickable ? "interactive" : "base");
  const overrideSx = (config.value as { sx?: Record<string, unknown> })?.sx;
  const valuePath = (config.value as { path?: string })?.path;
  const isZero =
    Boolean(config.zeroSub) && valuePath != null && Number(delve(data, valuePath) ?? 0) === 0;
  const valueConfig = {
    ...config.value,
    sx: {
      ...VALUE_SX,
      ...(overrideSx ?? {}),
      ...(isZero ? { color: "text.disabled" } : {}),
    },
  } as GenericRendererConfig;

  let deltaText = "";
  if (config.delta) {
    const template = t(config.delta.name);
    const dynamic = config.delta.value != null ? delve(data, config.delta.value) : undefined;
    deltaText =
      dynamic == null
        ? template
        : template.includes("{value}")
          ? template.replace(/\{value\}/g, String(dynamic))
          : `${template} ${dynamic}`;
  }

  const deltaColor = config.delta?.color ?? DELTA_COLOR;

  const cardSx = kpiMode
    ? { color: "text.primary", height: "100%" }
    : { color: "text.primary", height: "100%", borderRadius: "14px", padding: "18px 20px" };

  const card = (
    <Card variant={variant} sx={cardSx}>
      {kpiMode ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: "14px",
          }}
        >
          <Typography sx={{ fontSize: 12.5, color: "text.secondary" }}>
            {config.label ? t(config.label.name) : ""}
          </Typography>
          {config.icon ? (
            <IconRenderer
              name={config.icon.name}
              size={config.icon.size ?? ICON_SIZE}
              color={config.icon.color ?? ICON_COLOR}
            />
          ) : null}
        </Box>
      ) : (
        <Typography sx={{ fontSize: 13, color: "text.secondary", mb: "10px" }}>
          {config.label ? t(config.label.name) : ""}
        </Typography>
      )}

      {config.progress || config.action ? (
        <ProgressStatBody config={config} data={data} t={t} />
      ) : kpiMode ? (
        <>
          {config.value ? <GenericRenderer config={valueConfig} data={data} /> : null}
          {isZero && config.zeroSub ? (
            <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "8px" }}>
              {t(config.zeroSub.name)}
            </Typography>
          ) : config.sub ? (
            <Typography
              sx={{
                fontSize: 12,
                color: "text.secondary",
                mt: "8px",
                ...config.sub.sx,
              }}
            >
              {t(config.sub.name, data)}
            </Typography>
          ) : null}
        </>
      ) : isZero && config.zeroSub ? (
        <Box>
          {config.value ? <GenericRenderer config={valueConfig} data={data} /> : null}
          <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "4px" }}>
            {t(config.zeroSub.name)}
          </Typography>
        </Box>
      ) : (
        <>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
            {config.value ? <GenericRenderer config={valueConfig} data={data} /> : null}
            {deltaText ? (
              pill ? (
                <Chip variant="soft" color="primary" size="small" label={deltaText} />
              ) : (
                <Box component="span" sx={{ fontSize: 12, fontWeight: 600, color: deltaColor }}>
                  {deltaText}
                </Box>
              )
            ) : null}
          </Box>
          {config.sub ? (
            <Typography
              sx={{ fontSize: 10.5, color: "surface.textFaint", mt: "6px", ...config.sub.sx }}
            >
              {t(config.sub.name, data)}
            </Typography>
          ) : null}
        </>
      )}
    </Card>
  );

  if (config.link) {
    return (
      <LinkRenderer config={{ ...config.link, sx: { display: "block", ...config.link.sx } }}>
        {card}
      </LinkRenderer>
    );
  }
  return card;
}

/** Placeholder tile — same padding and rhythm as StatCard so the grid doesn't
 * jump when the real numbers land. */
function StatCardSkeleton({ config }: { config?: StatCardRendererConfig }) {
  const pill = config?.delta?.variant === "pill";
  const kpiMode = Boolean(config?.icon || config?.progress);
  return (
    <Card
      variant="base"
      sx={{
        height: "100%",
        color: "text.primary",
        ...(kpiMode ? {} : { borderRadius: "14px", padding: pill ? "18px 20px" : "16px 18px" }),
      }}
    >
      <Skeleton variant="text" width="45%" height={16} />
      <Box sx={{ display: "flex", alignItems: "center", gap: "9px", mt: pill ? "10px" : "8px" }}>
        <Skeleton variant="text" width={64} height={30} />
        {config?.delta ? (
          <Skeleton variant="rounded" width={48} height={20} sx={{ borderRadius: "999px" }} />
        ) : null}
      </Box>
      {config?.sub ? <Skeleton variant="text" width="60%" height={13} sx={{ mt: "6px" }} /> : null}
    </Card>
  );
}

export function StatCardRenderer({
  id,
  config: configProp,
  data: dataProp,
  gap = "14px",
}: {
  id: string;
  config?: StatCardRendererConfig | StatCardRendererConfig[];
  data?: Record<string, unknown>;
  gap?: string | number;
}) {
  const configFromId = useConfiguration<StatCardRendererConfig | StatCardRendererConfig[]>(id);
  const source = configProp ?? configFromId;
  const configs = Array.isArray(source) ? source : [source];
  const { t } = useTranslation(id);
  const seedData = seedRecord(dataProp);
  const { data: resolved, isLoading } = useFetch<Record<string, unknown>>(id, {
    data: seedData,
  });
  const data = resolved ?? {};

  // The grid comes from the config: one column per unit of `span` (default 1),
  // stacked to a single column below `md`.
  const columns = configs.reduce((total, config) => total + (config?.span ?? 1), 0);

  const cards = configs.map((config, i) => (
    <Box
      key={config?.label?.name ?? i}
      // `display: grid` stretches the tile (or its link wrapper) to the row
      // height, so spans of different content stay level.
      sx={{
        display: "grid",
        minWidth: 0,
        gridColumn: { xs: "auto", md: `span ${config?.span ?? 1}` },
      }}
    >
      {isLoading ? (
        <StatCardSkeleton config={config} />
      ) : (
        <StatCard config={config} data={data} t={t} />
      )}
    </Box>
  ));

  if (configs.length > 1) {
    return (
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: `repeat(${columns}, minmax(0,1fr))` },
          gap,
        }}
      >
        {cards}
      </Box>
    );
  }
  return <>{cards}</>;
}
