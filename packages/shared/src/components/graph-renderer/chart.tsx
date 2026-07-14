"use client";

import Box from "@mui/material/Box";
import type { ApexOptions } from "apexcharts";
import { useEffect, useMemo, useRef } from "react";

export type ApexChartType = "bar" | "line" | "area" | "pie" | "donut";

// ApexCharts driven imperatively via the core lib (not react-apexcharts, whose
// class component renders blank under React 19 StrictMode + Turbopack). The lib
// is imported dynamically on the client only (it touches `window`). The chart is
// recreated whenever its inputs change (keyed on a JSON snapshot) rather than
// patched in place — incremental updateOptions/updateSeries race the async
// render() and choke on partial option objects.
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
  // Functions (formatters) are dropped by stringify — fine, they rarely change.
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
      // A key whose value is `undefined` makes apex throw (it reads `.colors`
      // off every config key). Drop them defensively.
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
