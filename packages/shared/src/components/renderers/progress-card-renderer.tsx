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

export type ProgressTone = "primary" | "success" | "warning" | "error" | "info" | "violet";

export interface ProgressCardRendererConfig {
  /** Translation keys for the tinted header. */
  title: string;
  subtitle?: string;
  /** Header glyph and its tint. */
  icon?: string;
  tone?: ProgressTone;
  /** Header link. */
  cta?: LinkRendererConfig & { ctaLabel: string };
  paths?: {
    label?: string;
    /** Printed on the right of the label. */
    value?: string;
    /** 0–100. Omit and the row renders as a plain line with no bar. */
    percent?: string;
    tone?: string;
    /** Small red chip after the label — the design flags a stalled stage. */
    flag?: string;
  };
  /** Closing note under the rows. */
  note?: string;
}

/**
 * A stack of labelled bars: this week's goals, the stages on your desk, the
 * coaching notes a lead leaves. One shape because they are the same statement
 * — *this much of that*, with the bar carrying the ratio the number states.
 *
 * Rows with no `percent` render as a plain label/value line, so the same card
 * serves a list that has no target to measure against.
 */
export function ProgressCardRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<ProgressCardRendererConfig>(id);
  const { data } = useFetch<Record<string, unknown>[]>(id, {
    data: seedRows<Record<string, unknown>>(undefined),
  });
  const rows = Array.isArray(data) ? data : [];
  if (!config || !rows.length) return null;

  const paths = config.paths ?? {};
  const headerTone = config.tone ?? "primary";

  return (
    <Card
      variant="base"
      data-testid={`progress-card-${id}`}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", minWidth: 0 }}>
          {config.icon ? (
            <Box
              sx={{
                width: 28,
                height: 28,
                flex: "none",
                borderRadius: "8px",
                bgcolor: "background.paper",
                color: TONE_FG[headerTone],
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <IconRenderer name={config.icon} size={16} color="inherit" />
            </Box>
          ) : null}
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{t(config.title)}</Typography>
            {config.subtitle ? (
              <Typography sx={{ fontSize: 11.5, color: "surface.textMuted", mt: "1px" }}>
                {t(config.subtitle)}
              </Typography>
            ) : null}
          </Box>
        </Box>
        {config.cta ? (
          <LinkRenderer
            config={{
              ...config.cta,
              text: t(config.cta.ctaLabel),
              sx: { fontSize: 12, fontWeight: 700, flex: "none" },
            }}
          />
        ) : null}
      </Box>

      <Box
        sx={{
          flex: 1,
          p: "14px 18px 16px",
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        {rows.map((row, index) => {
          const tone = (delve(row, paths.tone ?? "tone") ?? "primary") as ProgressTone;
          const label = String(delve(row, paths.label ?? "label") ?? "");
          const percent = paths.percent ? Number(delve(row, paths.percent) ?? 0) : null;
          const flag = paths.flag ? delve(row, paths.flag) : undefined;
          return (
            <Box key={String(delve(row, "id") ?? label ?? index)}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "baseline",
                  justifyContent: "space-between",
                  gap: "10px",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
                  <Typography
                    noWrap
                    sx={{ fontSize: 12.5, fontWeight: 600, color: "surface.textMuted" }}
                  >
                    {t(label, row)}
                  </Typography>
                  {flag ? (
                    <Box
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 19,
                        px: "7px",
                        borderRadius: "5px",
                        bgcolor: "surface.errorSoftBg",
                        color: "surface.errorFg",
                        fontSize: 10,
                        fontWeight: 700,
                        flex: "none",
                      }}
                    >
                      {t(String(flag), row)}
                    </Box>
                  ) : null}
                </Box>
                <Typography
                  sx={{
                    fontSize: 12,
                    fontWeight: 700,
                    fontVariantNumeric: "tabular-nums",
                    color: TONE_FG[tone],
                    flex: "none",
                  }}
                >
                  {String(delve(row, paths.value ?? "value") ?? "")}
                </Typography>
              </Box>
              {percent !== null ? (
                <Box
                  sx={{
                    height: 7,
                    borderRadius: "999px",
                    bgcolor: "surface.hover",
                    overflow: "hidden",
                    mt: "6px",
                  }}
                >
                  <Box
                    sx={{
                      display: "block",
                      height: "100%",
                      width: `${Math.min(100, Math.max(0, percent))}%`,
                      borderRadius: "999px",
                      bgcolor: TONE_FG[tone],
                    }}
                  />
                </Box>
              ) : null}
            </Box>
          );
        })}
        {config.note ? (
          <Typography
            sx={{
              fontSize: 11,
              lineHeight: 1.55,
              color: "text.secondary",
              mt: "auto",
              pt: "4px",
            }}
          >
            {t(config.note)}
          </Typography>
        ) : null}
      </Box>
    </Card>
  );
}
