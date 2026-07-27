"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { useState } from "react";
import { useFormatters } from "../../utils/format";
import { seedRows } from "../../utils/seed-data";
import { IconRenderer } from "../renderers/icon-renderer";
import type { GraphRow } from "./graph-renderer.types";

export interface BarChartPeriod {
  /** Passed to the datasource as `{ [periodKey]: value }`. */
  value: string;
  /** Translation key. */
  label: string;
}

export interface BarChartTab {
  /** Data path this tab plots. */
  path: string;
  /** Translation key. */
  label: string;
}

export interface BarChartRendererConfig {
  /** Small label above the total. Translation key. */
  label: { name: string };
  /** Path for each row's x-axis category. */
  categoryPath: string;
  /** Category values are ISO dates formatted with these Intl options. */
  categoryDateOptions?: Intl.DateTimeFormatOptions;
  /** Plotted metrics; the first is selected initially. Falls back to `valuePath`. */
  tabs?: BarChartTab[];
  valuePath?: string;
  /** Period selector pill. `key` is the filter name sent to the datasource. */
  period?: { key: string; options: BarChartPeriod[] };
  /** Floating badge over the tallest bar. Translation key, interpolated with
   * the row plus `{{value}}` and `{{category}}`. */
  peak?: { name: string };
  /** Show the "123" toggle that labels every bar with its value. */
  valueToggle?: boolean;
  /** Plot area height in px (design: 190). */
  height?: number;
}

const IDLE_BAR = "var(--mui-palette-surface-neutral)";

/** Placeholder bar heights — a static silhouette, so the loading state does not
 * animate its own shape while shimmering. */
const SKELETON_BARS = [38, 62, 45, 80, 55, 30, 70, 48, 88, 40, 66, 52, 74, 44];

export function BarChartRenderer({
  id,
  config: configProp,
  data: dataProp,
}: {
  id: string;
  config?: BarChartRendererConfig;
  data?: GraphRow[];
}) {
  const configFromId = useConfiguration<BarChartRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { t } = useTranslation(id);
  const { formatDate, formatNumber } = useFormatters();
  const [periodIndex, setPeriodIndex] = useState(0);
  const [tabIndex, setTabIndex] = useState(0);
  const [showValues, setShowValues] = useState(false);
  const [periodMenu, setPeriodMenu] = useState<HTMLElement | null>(null);

  const period = config?.period?.options[periodIndex];
  const { data, isLoading } = useFetch<GraphRow[]>(id, {
    data: seedRows<GraphRow>(dataProp),
    filters: config?.period && period ? { [config.period.key]: period.value } : undefined,
  });
  const rows = Array.isArray(data) ? data : [];

  if (!config) return null;

  const valuePath = config.tabs?.[tabIndex]?.path ?? config.valuePath ?? "value";
  const values = rows.map((row) => Number(delve(row, valuePath) ?? 0));
  const total = values.reduce((sum, value) => sum + value, 0);
  const ceiling = Math.max(...values, 1);
  const peakIndex = values.indexOf(Math.max(...values, 0));

  const categoryOf = (row: GraphRow) => {
    const raw = String(delve(row, config.categoryPath) ?? "");
    if (!config.categoryDateOptions) return raw;
    return formatDate(raw, config.categoryDateOptions);
  };

  return (
    <Card variant="base" sx={{ p: "20px 22px" }}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Box>
          <Typography sx={{ fontSize: 13, color: "text.secondary", mb: "6px" }}>
            {t(config.tabs?.[tabIndex]?.label ?? config.label.name)}
          </Typography>
          {isLoading ? (
            <Skeleton variant="text" width={90} height={34} />
          ) : (
            <Typography sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.01em" }}>
              {formatNumber(total)}
            </Typography>
          )}
        </Box>
        {config.period && period ? (
          <Box>
            <Box
              onClick={(event) => setPeriodMenu(event.currentTarget)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                p: "8px 14px",
                borderRadius: "999px",
                border: "1px solid",
                borderColor: "surface.borderStrong",
                fontSize: 12.5,
                cursor: "pointer",
                "&:hover": { background: "action.hover" },
              }}
            >
              {t(period.label)}
              <IconRenderer name="expand-more" size={15} />
            </Box>
            <Menu
              anchorEl={periodMenu}
              open={Boolean(periodMenu)}
              onClose={() => setPeriodMenu(null)}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              {config.period.options.map((option, index) => (
                <MenuItem
                  key={option.value}
                  selected={index === periodIndex}
                  onClick={() => {
                    setPeriodIndex(index);
                    setPeriodMenu(null);
                  }}
                  sx={{ minWidth: 168, justifyContent: "space-between", gap: "10px" }}
                >
                  {t(option.label)}
                  {index === periodIndex ? (
                    <IconRenderer name="check" size={15} color="var(--mui-palette-primary-light)" />
                  ) : null}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          m: "16px 0 6px",
        }}
      >
        <Box sx={{ display: "flex", gap: "8px" }}>
          {(config.tabs ?? []).map((tab, index) => {
            const active = index === tabIndex;
            return (
              <Box
                key={tab.path}
                onClick={() => setTabIndex(index)}
                sx={{
                  p: "7px 14px",
                  borderRadius: "999px",
                  border: "1px solid",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  ...(active
                    ? {
                        background: "surface.primarySoftBg",
                        borderColor: "surface.primarySoftBorder",
                        color: "surface.primarySoftFg",
                      }
                    : {
                        background: "transparent",
                        borderColor: "surface.border",
                        color: "text.secondary",
                      }),
                }}
              >
                {t(tab.label)}
              </Box>
            );
          })}
        </Box>
        {config.valueToggle ? (
          <Box sx={{ display: "flex", gap: "8px" }}>
            <Box
              onClick={() => setShowValues((v) => !v)}
              title={t(config.label.name)}
              sx={{
                width: 30,
                height: 30,
                borderRadius: "999px",
                border: "1px solid",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                ...(showValues
                  ? {
                      background: "surface.primarySoftBg",
                      borderColor: "surface.primarySoftBorder",
                      color: "surface.primarySoftFg",
                    }
                  : { borderColor: "surface.border", color: "surface.textMuted" }),
              }}
            >
              <IconRenderer name="list-numbered" size={15} color="inherit" />
            </Box>
          </Box>
        ) : null}
      </Box>

      <Box sx={{ pt: "44px" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-end",
            gap: "10px",
            height: config.height ?? 190,
            borderBottom: "1px solid",
            borderColor: "surface.divider",
          }}
        >
          {isLoading
            ? SKELETON_BARS.map((height, index) => (
                <Skeleton
                  // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length placeholder row
                  key={index}
                  variant="rounded"
                  height={`${height}%`}
                  sx={{ flex: 1, borderRadius: "6px 6px 0 0" }}
                />
              ))
            : null}
          {rows.map((row, index) => {
            const value = values[index] ?? 0;
            const isPeak = config.peak && index === peakIndex && value > 0;
            return (
              <Box
                key={String(delve(row, config.categoryPath) ?? index)}
                sx={{
                  flex: 1,
                  height: `${Math.max((value / ceiling) * 100, value > 0 ? 2 : 0)}%`,
                  background: (theme) => (isPeak ? theme.gradients.bar : IDLE_BAR),
                  borderRadius: "6px 6px 0 0",
                  position: "relative",
                }}
              >
                {isPeak ? (
                  <>
                    <Box
                      sx={{
                        position: "absolute",
                        top: -42,
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "#F5F3F0",
                        color: "#1a1a1a",
                        fontSize: 12,
                        fontWeight: 700,
                        p: "6px 11px",
                        borderRadius: "8px",
                        whiteSpace: "nowrap",
                        boxShadow: "0 10px 24px rgba(0,0,0,.4)",
                      }}
                    >
                      {t(config.peak?.name ?? "", {
                        ...row,
                        value: formatNumber(value),
                        category: categoryOf(row),
                      })}
                    </Box>
                    <Box
                      sx={{
                        position: "absolute",
                        top: 10,
                        left: "50%",
                        transform: "translateX(-50%)",
                        width: 8,
                        height: 8,
                        borderRadius: "999px",
                        background: "#fff",
                      }}
                    />
                  </>
                ) : null}
                {showValues && !isPeak ? (
                  <Box
                    sx={{
                      position: "absolute",
                      top: -20,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontSize: 10.5,
                      fontWeight: 600,
                      color: "text.secondary",
                    }}
                  >
                    {formatNumber(value)}
                  </Box>
                ) : null}
              </Box>
            );
          })}
        </Box>
        <Box
          sx={{
            display: "flex",
            gap: "10px",
            mt: "6px",
            fontSize: 11,
            color: "text.disabled",
          }}
        >
          {rows.map((row, index) => (
            <Box
              key={String(delve(row, config.categoryPath) ?? index)}
              component="span"
              sx={{ flex: 1, textAlign: "center" }}
            >
              {categoryOf(row)}
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
