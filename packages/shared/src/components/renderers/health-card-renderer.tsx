"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { seedRows } from "../../utils/seed-data";
import { IconRenderer } from "./icon-renderer";
import { TONE_BG, TONE_FG } from "./tones";

export type HealthTone = "primary" | "success" | "warning" | "error" | "info" | "violet";

export interface HealthCardRendererConfig {
  title: string;
  icon?: string;
  tone?: HealthTone;
  /**
   * `strip` is the design's one-line system status — dot, label, value, note,
   * laid out horizontally. `bands` is the stacked capacity meter: a single
   * segmented bar built from every row's share, then the rows beneath it.
   */
  layout?: "strip" | "bands";
  /** Headline figure printed top-right (capacity, uptime). */
  summary?: { valuePath: string; label: string; tonePath?: string };
  paths?: {
    label?: string;
    value?: string;
    note?: string;
    tone?: string;
    /** 0–100 share of the bar. `bands` only. */
    percent?: string;
  };
}

/**
 * Two readings of the same question — is this healthy? `strip` answers it for
 * a system (each row an independent check); `bands` answers it for a team,
 * where the rows are shares of one whole and the bar shows the split before
 * any number is read.
 */
export function HealthCardRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<HealthCardRendererConfig>(id);
  const { data } = useFetch<Record<string, unknown>[]>(id, {
    data: seedRows<Record<string, unknown>>(undefined),
  });
  const rows = Array.isArray(data) ? data : [];
  if (!config || !rows.length) return null;

  const paths = config.paths ?? {};
  const headerTone = config.tone ?? "success";
  const bands = config.layout === "bands";
  const toneOf = (row: Record<string, unknown>) =>
    (delve(row, paths.tone ?? "tone") ?? "success") as HealthTone;

  const header = (
    <Box sx={{ display: "flex", alignItems: "center", gap: "9px", flex: "none" }}>
      {config.icon ? (
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "8px",
            bgcolor: TONE_BG[headerTone],
            color: TONE_FG[headerTone],
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconRenderer name={config.icon} size={16} color="inherit" />
        </Box>
      ) : null}
      <Typography sx={{ fontSize: 13, fontWeight: 700 }}>{t(config.title)}</Typography>
    </Box>
  );

  // The system strip: one card, every check on one line.
  if (!bands) {
    return (
      <Card
        variant="base"
        data-testid={`health-card-${id}`}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "18px",
          flexWrap: "wrap",
          p: "14px 18px",
        }}
      >
        {header}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "22px",
            flexWrap: "wrap",
            flex: 1,
            minWidth: 0,
          }}
        >
          {rows.map((row, index) => {
            const label = String(delve(row, paths.label ?? "label") ?? "");
            const tone = toneOf(row);
            return (
              <Box
                key={String(delve(row, "id") ?? label ?? index)}
                sx={{ display: "flex", alignItems: "center", gap: "8px" }}
              >
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    flex: "none",
                    borderRadius: "999px",
                    bgcolor: TONE_FG[tone],
                  }}
                />
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                  {t(label, row)}
                </Typography>
                <Typography sx={{ fontSize: 12, fontWeight: 700, color: TONE_FG[tone] }}>
                  {String(delve(row, paths.value ?? "value") ?? "")}
                </Typography>
                {paths.note ? (
                  <Typography sx={{ fontSize: 11, color: "surface.textFaint" }}>
                    {String(delve(row, paths.note) ?? "")}
                  </Typography>
                ) : null}
              </Box>
            );
          })}
        </Box>
      </Card>
    );
  }

  // The capacity meter: one segmented bar, then the legend that reads it.
  const summaryRow = config.summary
    ? { value: delve(rows[0] ?? {}, config.summary.valuePath), label: config.summary.label }
    : null;

  return (
    <Card
      variant="base"
      data-testid={`health-card-${id}`}
      sx={{ p: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          p: "14px 18px",
          bgcolor: TONE_BG[headerTone],
        }}
      >
        {header}
        {summaryRow ? (
          <Box sx={{ display: "flex", alignItems: "baseline", gap: "6px", flex: "none" }}>
            <Typography
              sx={{
                fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
                fontSize: 19,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                color: TONE_FG[headerTone],
              }}
            >
              {String(summaryRow.value ?? "")}
            </Typography>
            <Typography sx={{ fontSize: 11, color: "surface.textMuted" }}>
              {t(summaryRow.label)}
            </Typography>
          </Box>
        ) : null}
      </Box>

      <Box
        sx={{
          flex: 1,
          p: "14px 18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "11px",
        }}
      >
        <Box
          sx={{
            display: "flex",
            height: 7,
            borderRadius: "999px",
            overflow: "hidden",
            bgcolor: "surface.hover",
          }}
        >
          {rows.map((row, index) => (
            <Box
              key={`band-${String(delve(row, "id") ?? index)}`}
              sx={{
                height: "100%",
                width: `${Number(delve(row, paths.percent ?? "percent") ?? 0)}%`,
                bgcolor: TONE_FG[toneOf(row)],
              }}
            />
          ))}
        </Box>
        {rows.map((row, index) => {
          const label = String(delve(row, paths.label ?? "label") ?? "");
          const tone = toneOf(row);
          return (
            <Box
              key={String(delve(row, "id") ?? label ?? index)}
              sx={{ display: "flex", alignItems: "center", gap: "10px" }}
            >
              <Box
                sx={{
                  width: 9,
                  height: 9,
                  flex: "none",
                  borderRadius: "999px",
                  bgcolor: TONE_FG[tone],
                }}
              />
              <Typography
                sx={{
                  fontSize: 12.5,
                  fontWeight: 700,
                  color: TONE_FG[tone],
                  fontVariantNumeric: "tabular-nums",
                  flex: "none",
                }}
              >
                {String(delve(row, paths.value ?? "value") ?? "")}
              </Typography>
              <Typography sx={{ flex: 1, minWidth: 0, fontSize: 12, color: "surface.textMuted" }}>
                {t(label, row)}
              </Typography>
              {paths.note ? (
                <Typography sx={{ fontSize: 11, color: "text.secondary", flex: "none" }}>
                  {String(delve(row, paths.note) ?? "")}
                </Typography>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
