"use client";

import Box from "@mui/material/Box";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "@recruit/shared";
import delve from "dlv";
import { useState } from "react";
import type { HiringConfig } from "./hiring.configuration";

interface HiringData {
  total: number;
  points: Record<string, unknown>[];
}

// Round up to a "nice" axis maximum (268 → 300, 90 → 100, 18 → 20).
function niceMax(v: number): number {
  if (v <= 0) return 10;
  const pow = 10 ** Math.floor(Math.log10(v));
  const n = v / pow;
  const nice =
    n <= 1
      ? 1
      : n <= 1.5
        ? 1.5
        : n <= 2
          ? 2
          : n <= 3
            ? 3
            : n <= 5
              ? 5
              : n <= 7
                ? 7
                : 10;
  return nice * pow;
}

export function HiringComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<HiringConfig>(id);
  const { data } = useFetch<HiringData>(id);
  const points = data?.points ?? [];

  const metrics = config?.metrics ?? [];
  const periods = config?.periods ?? [];
  const [metricKey, setMetricKey] = useState(metrics[0]?.key ?? "");
  const [periodIdx, setPeriodIdx] = useState(0);
  const [showValues, setShowValues] = useState(false);

  if (!config) return null;
  const metric = metrics.find((m) => m.key === metricKey) ?? metrics[0];
  const color = metric?.color ?? "#FF8A3C";
  const period = periods[periodIdx];

  const values = points.map((p) => Number(delve(p, metric?.key ?? "") ?? 0));
  const total = values.reduce((sum, v) => sum + v, 0);
  const max = niceMax(Math.max(1, ...values));
  const peakIndex = values.indexOf(Math.max(...values));
  const yLabels = [max, Math.round((max * 2) / 3), Math.round(max / 3), 0];

  const iconBtn = (active: boolean) => ({
    width: 30,
    height: 30,
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: active ? "#F0B27C" : "#9A968E",
    background: active ? "rgba(242,106,27,.14)" : "transparent",
    border: `1px solid ${active ? "rgba(242,106,27,.3)" : "rgba(255,255,255,.12)"}`,
    "&:hover": {
      background: active ? "rgba(242,106,27,.18)" : "rgba(255,255,255,.06)",
    },
  });

  return (
    <Box
      sx={{
        background: "#1C1C1B",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: "16px",
        p: "20px 22px",
      }}
    >
      {/* Title + total + period */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Box sx={{ fontSize: 13, color: "#9A968E", mb: "6px" }}>
            {t(config.header?.title ?? "title")}
          </Box>
          <Box sx={{ fontSize: 26, fontWeight: 700, letterSpacing: "-.01em" }}>
            {total.toLocaleString()}
          </Box>
        </Box>
        {periods.length ? (
          <Box
            onClick={() => setPeriodIdx((i) => (i + 1) % periods.length)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "7px",
              p: "8px 14px",
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,.14)",
              fontSize: 12.5,
              cursor: "pointer",
              "&:hover": { background: "rgba(255,255,255,.06)" },
            }}
          >
            {period ? t(period.label) : ""}
            <IconRenderer name="expand-more" size={15} color="#9A968E" />
          </Box>
        ) : null}
      </Box>

      {/* Metric tabs + value/more buttons */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          m: "16px 0 6px",
        }}
      >
        <Box sx={{ display: "flex", gap: "8px" }}>
          {metrics.map((m) => {
            const active = m.key === metric?.key;
            return (
              <Box
                key={m.key}
                onClick={() => setMetricKey(m.key)}
                sx={{
                  p: "7px 14px",
                  borderRadius: "999px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: active ? "#F0B27C" : "#9A968E",
                  background: active ? "rgba(242,106,27,.14)" : "transparent",
                  border: `1px solid ${active ? "rgba(242,106,27,.35)" : "rgba(255,255,255,.1)"}`,
                }}
              >
                {t(m.label)}
              </Box>
            );
          })}
        </Box>
        <Box sx={{ display: "flex", gap: "8px" }}>
          <Box
            onClick={() => setShowValues((v) => !v)}
            title={t("showValues", "Show values")}
            sx={iconBtn(showValues)}
          >
            <IconRenderer name="bar-chart" size={16} />
          </Box>
          <Box sx={iconBtn(false)}>
            <IconRenderer name="more" size={16} />
          </Box>
        </Box>
      </Box>

      {/* Bars + axes */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "34px 1fr",
          gap: "8px",
          mt: "14px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            fontSize: 11,
            color: "#7C7972",
            pb: "18px",
          }}
        >
          {yLabels.map((y) => (
            <span key={y}>{y}</span>
          ))}
        </Box>
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              gap: "10px",
              height: 190,
              borderBottom: "1px solid rgba(255,255,255,.08)",
            }}
          >
            {points.map((_, i) => {
              const value = values[i] ?? 0;
              const peak = i === peakIndex;
              return (
                <Box
                  // biome-ignore lint/suspicious/noArrayIndexKey: bars are positional.
                  key={i}
                  sx={{
                    flex: 1,
                    height: `${(value / max) * 100}%`,
                    borderRadius: "6px 6px 0 0",
                    position: "relative",
                    background: peak
                      ? `linear-gradient(180deg, ${color}, ${color}CC)`
                      : `linear-gradient(180deg, ${color}B0, ${color}3A)`,
                  }}
                >
                  {peak ? (
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
                        }}
                      >
                        {value.toLocaleString()}
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
                  {showValues && !peak ? (
                    <Box
                      sx={{
                        position: "absolute",
                        top: -18,
                        left: "50%",
                        transform: "translateX(-50%)",
                        fontSize: 10.5,
                        fontWeight: 600,
                        color: "#9A968E",
                      }}
                    >
                      {value.toLocaleString()}
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
              color: "#7C7972",
            }}
          >
            {points.map((p, i) => (
              <Box
                // biome-ignore lint/suspicious/noArrayIndexKey: labels are positional.
                key={i}
                sx={{ flex: 1, textAlign: "center" }}
              >
                {String(delve(p, config.categoryPath ?? "label") ?? "")}
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
