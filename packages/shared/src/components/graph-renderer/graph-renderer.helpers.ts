import type { ApexOptions } from "apexcharts";
import delve from "dlv";
import type { ApexChartType } from "./chart";
import type { GraphRendererConfig, GraphRow, TFuncLike } from "./graph-renderer.types";

export const DEFAULT_PALETTE = [
  "#FF8A3C",
  "#4EA874",
  "#9BB8D9",
  "#F0C27C",
  "#C99BE0",
  "#E89A9A",
  "#7FC8C0",
  "#E4560F",
];

const AXIS_COLOR = "#7C7972";
const GRID_COLOR = "rgba(255,255,255,.06)";

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

export function buildOptions(config: GraphRendererConfig, rows: GraphRow[]): ApexOptions {
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
      theme: "dark",
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
      categories: rows.map((r) => String(delve(r, config.categoryPath ?? "label") ?? "")),
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
