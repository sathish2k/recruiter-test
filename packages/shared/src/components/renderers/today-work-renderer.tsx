"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { seedRows } from "../../utils/seed-data";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";
import { TONE_BG, TONE_FG } from "./tones";

export type WorkTone = "primary" | "success" | "warning" | "error" | "info" | "violet";

export interface TodayWorkRendererConfig {
  /** Translation keys for the amber header. */
  title: string;
  subtitle?: string;
  /** Header call to action. */
  cta?: LinkRendererConfig & { ctaLabel: string };
  /** Data paths on each row. */
  paths?: {
    count?: string;
    label?: string;
    detail?: string;
    tone?: string;
    icon?: string;
  };
  /** Where a row navigates. `params.id` is filled from the row's own id. */
  rowLink?: LinkRendererConfig;
  /**
   * `list` (default) is the design's two-column load, with the amber header and
   * a running total. `tiles` is the four-across alert grid it puts above that —
   * same rows, no header, each tile carrying its own tint. */
  layout?: "list" | "tiles";
}

/**
 * "Today's work" — the design's opening block. Not a list of records but a
 * count of *decisions*: six numbers, each one thing standing between the desk
 * and the end of the day, laid out two to a row so the whole load is visible
 * without scrolling.
 *
 * The header carries the total in an amber band because this is the one block
 * that should still be read at hour seven.
 */
export function TodayWorkRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<TodayWorkRendererConfig>(id);
  const { data } = useFetch<Record<string, unknown>[]>(id, {
    data: seedRows<Record<string, unknown>>(undefined),
  });
  const rows = Array.isArray(data) ? data : [];
  if (!config || !rows.length) return null;

  const paths = config.paths ?? {};
  const total = rows.reduce((sum, row) => sum + Number(delve(row, paths.count ?? "count") ?? 0), 0);

  // The alert grid: no header, no total — four tinted counts read at a glance.
  if (config.layout === "tiles") {
    return (
      <Box
        data-testid={`today-work-${id}`}
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4,minmax(0,1fr))" },
          gap: "12px",
        }}
      >
        {rows.map((row, index) => {
          const tone = (delve(row, paths.tone ?? "tone") ?? "primary") as WorkTone;
          const label = String(delve(row, paths.label ?? "label") ?? "");
          return (
            <Box
              key={String(delve(row, "id") ?? label ?? index)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                p: "13px 15px",
                borderRadius: "10px",
                bgcolor: TONE_BG[tone],
                color: "text.primary",
              }}
            >
              <Box sx={{ flex: "none", color: TONE_FG[tone], display: "flex" }}>
                <IconRenderer
                  name={String(delve(row, paths.icon ?? "icon") ?? "circle")}
                  size={20}
                  color="inherit"
                />
              </Box>
              <Box sx={{ minWidth: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
                    fontSize: 17,
                    fontWeight: 700,
                    lineHeight: 1.1,
                  }}
                >
                  {String(delve(row, paths.count ?? "count") ?? "")}
                </Typography>
                <Typography
                  sx={{ fontSize: 11.5, color: "surface.textMuted", mt: "3px", lineHeight: 1.4 }}
                >
                  {t(label, row)}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
    );
  }

  return (
    <Card variant="base" data-testid={`today-work-${id}`} sx={{ p: 0, overflow: "hidden" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          p: "14px 20px",
          bgcolor: "surface.warningSoftBg",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "11px", minWidth: 0 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              flex: "none",
              borderRadius: "10px",
              bgcolor: "background.paper",
              color: "surface.warningFg",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconRenderer name="bolt" size={19} color="inherit" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t(config.title)}</Typography>
              <Box
                sx={{
                  fontSize: 11.5,
                  fontWeight: 800,
                  color: "surface.warningFg",
                  bgcolor: "background.paper",
                  px: "8px",
                  py: "2px",
                  borderRadius: "6px",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {total}
              </Box>
            </Box>
            {config.subtitle ? (
              <Typography sx={{ fontSize: 11.5, color: "surface.textMuted", mt: "1px" }}>
                {t(config.subtitle)}
              </Typography>
            ) : null}
          </Box>
        </Box>
        {config.cta ? (
          <LinkRenderer config={{ ...config.cta, underline: "none" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                height: 34,
                px: "13px",
                borderRadius: "8px",
                bgcolor: "background.paper",
                color: "text.primary",
                fontSize: 12.5,
                fontWeight: 700,
                flex: "none",
                cursor: "pointer",
              }}
            >
              {t(config.cta.ctaLabel)}
              <IconRenderer name="arrow-forward" size={16} />
            </Box>
          </LinkRenderer>
        ) : null}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: "2px 18px",
          p: "8px 14px 12px",
        }}
      >
        {rows.map((row, index) => {
          const tone = (delve(row, paths.tone ?? "tone") ?? "primary") as WorkTone;
          const label = String(delve(row, paths.label ?? "label") ?? "");
          const item = (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "11px",
                p: "9px 8px",
                borderRadius: "9px",
                color: "text.primary",
                cursor: config.rowLink ? "pointer" : "default",
                transition: "var(--recruit-motion-state)",
                "&:hover": { bgcolor: "surface.hover" },
              }}
            >
              <Box
                sx={{
                  width: 28,
                  height: 28,
                  flex: "none",
                  borderRadius: "8px",
                  bgcolor: TONE_BG[tone],
                  color: TONE_FG[tone],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconRenderer
                  name={String(delve(row, paths.icon ?? "icon") ?? "circle")}
                  size={16}
                  color="inherit"
                />
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  fontSize: 18,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: TONE_FG[tone],
                  flex: "none",
                  minWidth: 22,
                }}
              >
                {String(delve(row, paths.count ?? "count") ?? "")}
              </Typography>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700 }}>
                  {t(label, row)}
                </Typography>
                <Typography noWrap sx={{ fontSize: 11, lineHeight: 1.45, color: "text.secondary" }}>
                  {t(String(delve(row, paths.detail ?? "detail") ?? ""), row)}
                </Typography>
              </Box>
              <Box sx={{ flex: "none", color: "text.secondary", display: "flex" }}>
                <IconRenderer name="chevron-right" size={17} color="inherit" />
              </Box>
            </Box>
          );
          const key = String(delve(row, "id") ?? label ?? index);
          return config.rowLink ? (
            <LinkRenderer
              key={key}
              config={{
                ...config.rowLink,
                underline: "none",
                params: { id: { type: "static", value: String(delve(row, "id") ?? "") } },
              }}
            >
              {item}
            </LinkRenderer>
          ) : (
            <Box key={key}>{item}</Box>
          );
        })}
      </Box>
    </Card>
  );
}
