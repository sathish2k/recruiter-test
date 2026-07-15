"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card, { type CardProps } from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Typography, { type TypographyProps } from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { useState } from "react";
import {
  GenericRenderer,
  type GenericRendererConfig,
} from "./generic-renderer";
import { Toast } from "../toast/toast";
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
  /** Theme Card variant override (e.g. "accent" for the gradient hero card).
   * Defaults to "interactive" when `link` is set, else "base". */
  variant?: CardProps["variant"];
  /** Leading icon rendered top-right in the card header row. */
  icon?: { name: string; size?: number; color?: string };
  /** Sub-metric line below the value. `name` is a translation key interpolated
   * against the full data row (i18next `{{token}}` style). */
  sub?: { name: string; sx?: TypographyProps["sx"] };
  /** Renders a target progress bar under the value. `targetPath` is the data
   * path for the target; the bar fills to value/target. */
  progress?: { targetPath: string };
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

const DELTA_COLOR = "#F0B27C";

const VALUE_SX = { fontSize: 25, fontWeight: 700, letterSpacing: "-.01em" };

const ICON_COLOR = "#F0B27C";
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
  const valuePath = (config.value as { path?: string }).path ?? "";
  const base = Number(delve(data, valuePath) ?? 0);
  const value = base + logged;
  const target = config.progress
    ? Number(delve(data, config.progress.targetPath) ?? 0)
    : 0;
  const pct = target > 0 ? Math.round((value / target) * 100) : 0;
  const overrideSx = (config.value as { sx?: Record<string, unknown> })?.sx;

  return (
    <>
      <Typography sx={{ ...VALUE_SX, ...(overrideSx ?? {}) }}>
        {value}
      </Typography>
      {config.sub ? (
        <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "8px" }}>
          {t(config.sub.name, { ...data, pct })}
        </Typography>
      ) : null}
      <Box
        sx={{
          height: 6,
          borderRadius: "999px",
          background: "rgba(255,255,255,.18)",
          overflow: "hidden",
          mt: "10px",
        }}
      >
        <Box
          sx={{
            width: `${Math.min(pct, 100)}%`,
            height: "100%",
            borderRadius: "999px",
            background: "rgba(255,255,255,.9)",
          }}
        />
      </Box>
      {config.action ? (
        <StatAction
          config={config}
          t={t}
          onLog={() => setLogged((c) => c + 1)}
        />
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
  const [toast, setToast] = useState<{ title: string; sub?: string } | null>(
    null,
  );
  const action = config.action;
  if (!action) return null;
  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          onLog();
          if (action.toast) {
            setToast({
              title: t(action.toast.title),
              sub: t(action.toast.sub),
            });
          }
        }}
        startIcon={
          action.icon ? (
            <IconRenderer name={action.icon} size={15} />
          ) : undefined
        }
        sx={{ fontSize: 12, mt: "14px" }}
      >
        {t(action.label.name)}
      </Button>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
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
  const kpiMode = Boolean(config.icon || config.sub || config.progress);
  const variant = config.variant ?? (clickable ? "interactive" : "base");
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

  const cardSx = kpiMode
    ? { color: "#ECEAE7" }
    : {
        color: "#ECEAE7",
        borderRadius: "14px",
        padding: pill ? "18px 20px" : "16px 18px",
      };

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
        <Typography
          sx={{
            fontSize: pill ? 13 : 12.5,
            color: "#9A968E",
            mb: pill ? "10px" : "8px",
          }}
        >
          {config.label ? t(config.label.name) : ""}
        </Typography>
      )}

      {config.progress || config.action ? (
        <ProgressStatBody config={config} data={data} t={t} />
      ) : kpiMode ? (
        <>
          {config.value ? (
            <GenericRenderer config={valueConfig} data={data} />
          ) : null}
          {config.sub ? (
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
      ) : (
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
      )}
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
  // The engine injects `data={}` when this renderer is used directly as a
  // bootstrap value; an empty object means "no data provided → fetch".
  const seedData =
    dataProp && Object.keys(dataProp).length > 0 ? dataProp : undefined;
  const { data: resolved } = useFetch<Record<string, unknown>>(id, {
    data: seedData,
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
