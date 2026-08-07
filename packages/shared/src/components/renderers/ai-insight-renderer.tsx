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

export type InsightTone = "primary" | "success" | "warning" | "error" | "info" | "violet";

export interface AiInsightRendererConfig {
  /** Translation keys for the header. */
  title: string;
  subtitle?: string;
  /** Header call to action. */
  cta?: LinkRendererConfig & { ctaLabel: string };
  paths?: { count?: string; label?: string; detail?: string; tone?: string; icon?: string };
  /** Where a pill navigates. */
  rowLink?: LinkRendererConfig;
}

/**
 * "What the AI found overnight" — a row of count pills, each a batch the model
 * produced while nobody was looking. Deliberately compact: these are findings
 * to open, not decisions to make, so they sit below the queue and never
 * compete with it.
 */
export function AiInsightRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<AiInsightRendererConfig>(id);
  const { data } = useFetch<Record<string, unknown>[]>(id, {
    data: seedRows<Record<string, unknown>>(undefined),
  });
  const rows = Array.isArray(data) ? data : [];
  if (!config || !rows.length) return null;

  const paths = config.paths ?? {};

  return (
    <Card variant="base" data-testid={`ai-insight-${id}`}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          mb: "14px",
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "11px", minWidth: 0 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              flex: "none",
              borderRadius: "10px",
              bgcolor: "surface.violetSoftBg",
              color: "surface.violetFg",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconRenderer name="auto-awesome" size={20} color="inherit" />
          </Box>
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t(config.title)}</Typography>
            {config.subtitle ? (
              <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "1px" }}>
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
                border: "1px solid",
                borderColor: "surface.border",
                fontSize: 12.5,
                fontWeight: 700,
                color: "text.primary",
                flex: "none",
                cursor: "pointer",
                "&:hover": { bgcolor: "surface.hover" },
              }}
            >
              {t(config.cta.ctaLabel)}
              <IconRenderer name="arrow-forward" size={16} />
            </Box>
          </LinkRenderer>
        ) : null}
      </Box>

      <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
        {rows.map((row, index) => {
          const tone = (delve(row, paths.tone ?? "tone") ?? "violet") as InsightTone;
          const label = String(delve(row, paths.label ?? "label") ?? "");
          const pill = (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                height: 38,
                pl: "9px",
                pr: "13px",
                borderRadius: "9px",
                bgcolor: "surface.inset",
                color: "text.primary",
                cursor: config.rowLink ? "pointer" : "default",
                transition: "var(--recruit-motion-state)",
                "&:hover": { bgcolor: "surface.hover" },
              }}
            >
              <Box
                sx={{
                  width: 24,
                  height: 24,
                  flex: "none",
                  borderRadius: "7px",
                  bgcolor: TONE_BG[tone],
                  color: TONE_FG[tone],
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconRenderer
                  name={String(delve(row, paths.icon ?? "icon") ?? "auto-awesome")}
                  size={14}
                  color="inherit"
                />
              </Box>
              <Typography
                sx={{
                  fontFamily: "var(--font-grotesk), 'Space Grotesk', system-ui, sans-serif",
                  fontSize: 15,
                  fontWeight: 700,
                  fontVariantNumeric: "tabular-nums",
                  color: TONE_FG[tone],
                  flex: "none",
                }}
              >
                {String(delve(row, paths.count ?? "count") ?? "")}
              </Typography>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                {t(label, row)}
              </Typography>
              <Box sx={{ flex: "none", color: "text.secondary", display: "flex" }}>
                <IconRenderer name="chevron-right" size={16} color="inherit" />
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
              {pill}
            </LinkRenderer>
          ) : (
            <Box key={key}>{pill}</Box>
          );
        })}
      </Box>
    </Card>
  );
}
