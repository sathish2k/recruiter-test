"use client";

import Box from "@mui/material/Box";
import type { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useRef } from "react";

export type ApexChartType = "bar" | "line" | "area" | "pie" | "donut";

export function Chart({
  type,
  series,
  options,
  height = 300,
}: {
  type: ApexChartType;
  series: ApexOptions["series"];
  options: ApexOptions;
  height?: number;
}) {
  const elRef = useRef<HTMLDivElement | null>(null);
  const key = useMemo(
    () => JSON.stringify({ type, height, series, options }),
    [type, height, series, options],
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: `key` captures series/options/type/height.
  useEffect(() => {
    let disposed = false;
    // biome-ignore lint/suspicious/noExplicitAny: ApexCharts instance is untyped here.
    let chart: any = null;
    const el = elRef.current;
    if (!el) return;
    import("apexcharts").then(({ default: ApexCharts }) => {
      if (disposed || !el) return;
      const merged: Record<string, unknown> = {
        ...options,
        chart: { ...options.chart, type, height },
        series,
      };
      for (const k of Object.keys(merged)) {
        if (merged[k] === undefined) delete merged[k];
      }
      chart = new ApexCharts(el, merged);
      chart.render();
    });
    return () => {
      disposed = true;
      chart?.destroy();
    };
  }, [key]);

  return <Box ref={elRef} sx={{ width: "100%", minHeight: height }} />;
}
