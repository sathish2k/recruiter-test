"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { seedRecord } from "../../utils/seed-data";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";
import { TONE_BG, TONE_FG } from "./tones";

/** The tones a banner may carry. Semantic — the tone *is* the state. */
export type BannerTone = "primary" | "success" | "warning" | "error" | "info";

export interface AlertBannerRendererConfig {
  /** Tone of the whole strip. Overridden per-row by `tonePath`. */
  tone?: BannerTone;
  /** Data path holding the tone, when the API decides it. */
  tonePath?: string;
  icon?: string;
  /** Data path holding the glyph name, when the API decides it. */
  iconPath?: string;
  /** Translation key, when the message is fixed. */
  title?: string;
  /** Data path holding the translation key, when the API decides which message
   * to show — which it does whenever the strip is composed per role. */
  titlePath?: string;
  /** Translation key for the body line. */
  body?: string;
  /** Data path holding the body's translation key. */
  bodyPath?: string;
  /** Call to action on the right. */
  cta?: LinkRendererConfig & { ctaLabel: string };
  /** Hide the whole strip when this path is falsy — an empty desk has no
   * alert, and an empty coloured band reads as a broken component. */
  showPath?: string;
}

/**
 * The single "what needs a decision" strip the design puts at the top of every
 * role's dashboard. One component, one config per role — the tone, glyph and
 * copy are all data or translation keys, never a branch on who is looking.
 */
export function AlertBannerRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<AlertBannerRendererConfig>(id);
  const { data } = useFetch<Record<string, unknown>>(id, {
    data: seedRecord<Record<string, unknown>>(undefined),
  });
  const row = (data ?? {}) as Record<string, unknown>;

  if (!config) return null;
  if (config.showPath && !row[config.showPath]) return null;

  const tone = ((config.tonePath ? row[config.tonePath] : undefined) ??
    config.tone ??
    "primary") as BannerTone;
  const icon = (config.iconPath ? row[config.iconPath] : undefined) ?? config.icon;
  // The API names the message; the translations supply the wording.
  const titleKey = (config.titlePath ? row[config.titlePath] : undefined) ?? config.title;
  const bodyKey = (config.bodyPath ? row[config.bodyPath] : undefined) ?? config.body;
  if (!titleKey) return null;

  return (
    <Card
      variant="base"
      data-testid={`alert-banner-${id}`}
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: "14px",
        p: "16px 18px",
        boxShadow: "none",
        bgcolor: TONE_BG[tone],
      }}
    >
      {icon ? (
        <Box sx={{ flex: "none", lineHeight: 1.2, color: TONE_FG[tone] }}>
          <IconRenderer name={String(icon)} size={22} color="inherit" />
        </Box>
      ) : null}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{ fontSize: 14, fontWeight: 700, color: "text.primary" }}>
          {t(String(titleKey), row)}
        </Typography>
        {bodyKey ? (
          <Typography
            sx={{
              fontSize: 12.5,
              lineHeight: 1.6,
              color: "surface.textMuted",
              mt: "3px",
              textWrap: "pretty",
            }}
          >
            {t(String(bodyKey), row)}
          </Typography>
        ) : null}
      </Box>
      {config.cta ? (
        <Box sx={{ flex: "none", pt: "2px" }}>
          <LinkRenderer
            config={{
              ...config.cta,
              text: t(config.cta.ctaLabel),
              sx: { fontSize: 12.5, fontWeight: 700, color: TONE_FG[tone] },
            }}
          />
        </Box>
      ) : null}
    </Card>
  );
}
