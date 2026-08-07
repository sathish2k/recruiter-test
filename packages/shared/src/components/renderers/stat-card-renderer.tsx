"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card, { type CardProps } from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography, { type TypographyProps } from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { useState } from "react";
import { seedRecord } from "../../utils/seed-data";
import { useToast } from "../toast/toast";
import { GenericRenderer, type GenericRendererConfig } from "./generic-renderer";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";
import { TONE_BG_VAR as TONE_BG, TONE_FG_VAR as TONE_FG } from "./tones";

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
  /** Tile scale. The design draws two: `md` on the dashboard (27px value in an
   * 18/20 card) and `sm` on list screens like Clients (25px in 16/18). */
  size?: StatCardSize;
  /** Grid columns this card occupies in the row (default 1) — how the config
   * allocates width across the tiles. Ignored below `md`, where cards stack. */
  span?: number;
  /** Theme Card variant override (e.g. "accent" for the gradient hero card).
   * Defaults to "interactive" when `link` is set, else "base". */
  variant?: CardProps["variant"];
  /** Tints the whole card, not just the icon tile. The design colours a KPI by
   * what it measures — revenue green, money owed red — so the row reads as a
   * status line before any number is parsed. */
  tone?: StatTone;
  /** Leading icon. In KPI mode the design draws it in a 32px tinted tile to
   * the left of the label; `tone` picks the tint. */
  icon?: { name: string; size?: number; color?: string; tone?: StatTone };
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

export type StatCardSize = "compact" | "sm" | "md";

/** The tints a KPI tile may carry. Semantic, never decorative — `primary` is
 * the action colour, `secondary` the amber "one thing in motion". */
export type StatTone =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "violet";

const DELTA_COLOR = "var(--mui-palette-surface-primarySoftFg)";

/** Every metric the design varies between the two tile scales. */
const SIZES = {
  md: {
    padding: "18px 20px",
    label: 13,
    labelGap: "10px",
    value: 26,
    sub: 10.5,
    subGap: "6px",
    delta: 12,
    deltaGap: "9px",
  },
  sm: {
    padding: "16px 18px",
    label: 12.5,
    labelGap: "8px",
    value: 25,
    sub: 11,
    subGap: "4px",
    delta: 12,
    deltaGap: "9px",
  },
  // The client-detail tiles, a step down again from the clients grid.
  compact: {
    padding: "15px 17px",
    label: 12,
    labelGap: "7px",
    value: 23,
    sub: 11,
    subGap: "4px",
    delta: 11.5,
    deltaGap: "8px",
  },
} as const;

const VALUE_SX = {
  fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
  fontWeight: 700,
  letterSpacing: "-.01em",
};

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
  const size = SIZES[config.size ?? "md"];
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
    sx: { ...VALUE_SX, fontSize: size.value, ...(overrideSx ?? {}) },
  } as GenericRendererConfig;

  return (
    <>
      {hasAction ? (
        <Typography sx={{ ...VALUE_SX, fontSize: size.value, ...(overrideSx ?? {}) }}>
          {value}
        </Typography>
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
  const size = SIZES[config.size ?? "md"];
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
      fontSize: size.value,
      ...(overrideSx ?? {}),
      ...(isZero ? { color: "text.disabled" } : {}),
    },
  } as GenericRendererConfig;

  let deltaText = "";
  if (config.delta) {
    const template = t(config.delta.name);
    const dynamic = config.delta.value != null ? delve(data, config.delta.value) : undefined;
    // A template that interpolates but has nothing to interpolate is worse than
    // no delta at all — it renders the literal "{value}" on the card.
    if (dynamic == null || dynamic === "") {
      deltaText = template.includes("{value}") ? "" : template;
    } else {
      deltaText = template.includes("{value}")
        ? template.replace(/\{value\}/g, String(dynamic))
        : `${template} ${dynamic}`;
    }
  }

  const deltaColor = config.delta?.color ?? DELTA_COLOR;

  const cardSx = kpiMode
    ? {
        color: "text.primary",
        height: "100%",
        // The design's KPI tile is 18/20, not the theme's uniform 20 — the
        // shorter top and bottom is what keeps the row from looking loose.
        padding: size.padding,
        ...(config.tone ? { bgcolor: TONE_BG[config.tone], boxShadow: "none" } : {}),
      }
    : { color: "text.primary", height: "100%", borderRadius: "14px", padding: size.padding };

  const card = (
    <Card variant={variant} sx={cardSx}>
      {kpiMode ? (
        // A KPI tile carrying a third line tightens the gap under the label so
        // label/value/sub still fit the same card height the design draws.
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            mb: config.sub ? "8px" : "12px",
          }}
        >
          {config.icon ? (
            <Box
              sx={{
                width: 32,
                height: 32,
                flex: "none",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: config.tone ? "background.paper" : TONE_BG[config.icon.tone ?? "primary"],
                color: config.icon.color ?? TONE_FG[config.icon.tone ?? "primary"],
              }}
            >
              <IconRenderer name={config.icon.name} size={config.icon.size ?? 18} color="inherit" />
            </Box>
          ) : null}
          <Typography sx={{ fontSize: 12.5, color: "surface.textMuted" }}>
            {config.label ? t(config.label.name) : ""}
          </Typography>
        </Box>
      ) : (
        <Typography sx={{ fontSize: size.label, color: "text.secondary", mb: size.labelGap }}>
          {config.label ? t(config.label.name) : ""}
        </Typography>
      )}

      {config.progress || config.action ? (
        <ProgressStatBody config={config} data={data} t={t} />
      ) : kpiMode ? (
        <>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "9px" }}>
            {config.value ? <GenericRenderer config={valueConfig} data={data} /> : null}
            {deltaText && !isZero ? (
              <Typography sx={{ fontSize: 12, fontWeight: 700, color: deltaColor }}>
                {deltaText}
              </Typography>
            ) : null}
          </Box>
          {isZero && config.zeroSub ? (
            <Typography sx={{ fontSize: 12, color: "text.disabled", mt: "8px" }}>
              {t(config.zeroSub.name)}
            </Typography>
          ) : config.sub ? (
            <Typography
              sx={{
                fontSize: 11.5,
                color: "surface.textMuted",
                mt: "4px",
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
          <Box sx={{ display: "flex", alignItems: "baseline", gap: size.deltaGap }}>
            {config.value ? <GenericRenderer config={valueConfig} data={data} /> : null}
            {deltaText ? (
              pill ? (
                <Chip variant="soft" color="primary" size="small" label={deltaText} />
              ) : (
                <Box
                  component="span"
                  sx={{ fontSize: size.delta, fontWeight: 600, color: deltaColor }}
                >
                  {deltaText}
                </Box>
              )
            ) : null}
          </Box>
          {config.sub ? (
            <Typography
              sx={{
                fontSize: size.sub,
                color: "surface.textFaint",
                mt: size.subGap,
                ...config.sub.sx,
              }}
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
  // Route params travel to the datasource as filters, so a tile on a detail
  // screen can scope its endpoint to that record. Datasources that don`t take
  // them simply ignore the extra keys.
  const routeParams = useRouteParams();
  const { data: resolved, isLoading } = useFetch<Record<string, unknown>>(id, {
    data: seedData,
    filters: routeParams,
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
