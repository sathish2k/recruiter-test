import type { ApexOptions } from "apexcharts";
import delve from "dlv";
import type { ApexChartType } from "./chart";
import type { GraphRendererConfig, GraphRow, TFuncLike } from "./graph-renderer.types";

/**
 * Categorical series. Three steps of the brand navy plus one warm neutral:
 * cool-versus-warm is the axis every red-green deficiency preserves, and
 * lightness carries the rest, so the set is colour-vision safe by construction
 * rather than by luck.
 *
 * Four is the ceiling, deliberately. A semantic hue is never a series — green
 * next to red is indistinguishable for ~8% of men, and an amber series reads
 * as a warning. Past four categories the answer is small multiples.
 */
export const DEFAULT_PALETTE = [
  "var(--mui-palette-surface-chart1)",
  "var(--mui-palette-surface-chart2)",
  "var(--mui-palette-surface-chart3)",
  "var(--mui-palette-surface-chart4)",
];

/** Magnitude, light → dark. Use when the series are ordered, not categorical. */
export const SEQUENTIAL_PALETTE = [
  "var(--mui-palette-surface-chartSeq1)",
  "var(--mui-palette-surface-chartSeq2)",
  "var(--mui-palette-surface-chartSeq3)",
  "var(--mui-palette-surface-chartSeq4)",
  "var(--mui-palette-surface-chartSeq5)",
];

/** Signed change, negative → neutral → positive. */
export const DIVERGING_PALETTE = [
  "var(--mui-palette-surface-chartDivNeg)",
  "var(--mui-palette-surface-chartDivMid)",
  "var(--mui-palette-surface-chartDivPos)",
];

const AXIS_COLOR = "var(--mui-palette-surface-chartAxis)";
const GRID_COLOR = "var(--mui-palette-surface-chartGrid)";

function formatValue(value: number, type?: GraphRendererConfig["valueType"]): string {
  if (type === "currency") return `$${value.toLocaleString()}`;
  if (type === "percentage") return `${value}%`;
  return value.toLocaleString();
}

const isCircular = (type: string) => type === "pie" || type === "donut";

export function toApexType(type: GraphRendererConfig["type"]): ApexChartType {
  return type;
}

// Build the apex `series` payload. Cartesian → [{ name, data[] }]; circular →
// number[] (labels are returned separately via the options).
export function buildSeries(
  config: GraphRendererConfig,
  rows: GraphRow[],
  t: TFuncLike,
): ApexOptions["series"] {
  if (isCircular(config.type)) {
    return rows.map((r) => Number(delve(r, config.valuePath ?? "value") ?? 0));
  }
  return (config.series ?? []).map((s) => ({
    name: t(s.label),
    data: rows.map((r) => Number(delve(r, s.path) ?? 0)),
  }));
}

export function buildColors(config: GraphRendererConfig): string[] {
  if (config.colors?.length) return config.colors;
  if (!isCircular(config.type) && config.series?.some((s) => s.color)) {
    return config.series.map((s, i) => s.color ?? DEFAULT_PALETTE[i % DEFAULT_PALETTE.length]);
  }
  return DEFAULT_PALETTE;
}

export function buildOptions(
  config: GraphRendererConfig,
  rows: GraphRow[],
  t: TFuncLike,
  // Apex paints its tooltip itself rather than from CSS variables, so it needs
  // the resolved scheme rather than a token.
  mode: "light" | "dark" = "light",
): ApexOptions {
  const colors = buildColors(config);
  const legend = config.legend ?? isCircular(config.type);

  const base: ApexOptions = {
    chart: {
      type: toApexType(config.type),
      toolbar: { show: false },
      zoom: { enabled: false },
      background: "transparent",
      foreColor: AXIS_COLOR,
      fontFamily: "inherit",
      animations: { speed: 400 },
    },
    colors,
    legend: {
      show: legend,
      position: "bottom",
      labels: { colors: AXIS_COLOR },
      markers: { size: 5 },
      fontSize: "12px",
    },
    dataLabels: { enabled: isCircular(config.type) },
    stroke: { curve: "smooth", width: config.type === "line" ? 2.5 : 1 },
    tooltip: {
      theme: mode,
      y: {
        formatter: (v: number) => formatValue(v, config.valueType),
      },
    },
    grid: { borderColor: GRID_COLOR, strokeDashArray: 4 },
  };

  // ApexCharts iterates config keys and reads `.colors` on each, so a key set to
  // `undefined` throws. Only ever add keys with real values.
  if (isCircular(config.type)) {
    return {
      ...base,
      labels: rows.map((r) => String(delve(r, config.labelPath ?? "label") ?? "")),
      ...(config.type === "donut" ? { plotOptions: { pie: { donut: { size: "68%" } } } } : {}),
      stroke: { width: 0 },
    };
  }

  return {
    ...base,
    plotOptions: {
      bar: {
        columnWidth: "52%",
        borderRadius: 6,
        borderRadiusApplication: "end",
      },
    },
    ...(config.type === "area"
      ? {
          fill: {
            type: "gradient",
            gradient: { opacityFrom: 0.35, opacityTo: 0.05 },
          },
        }
      : {}),
    xaxis: {
      categories: rows.map((r) => {
        const raw = String(delve(r, config.categoryPath ?? "label") ?? "");
        return config.categoryLabelPrefix ? t(`${config.categoryLabelPrefix}${raw}`) : raw;
      }),
      ...(config.categoryType === "datetime" ? { type: "datetime" as const } : {}),
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: AXIS_COLOR, fontSize: "12px" } },
    },
    yaxis: {
      labels: {
        style: { colors: AXIS_COLOR, fontSize: "12px" },
        formatter: (v: number) => formatValue(v, config.valueType),
      },
    },
    chart: { ...base.chart, stacked: config.stacked ?? false },
  };
}
