"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import { seedRecord } from "../../utils/seed-data";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";
import { TONE_BG, TONE_FG } from "./tones";

export type EmptyWorkspaceTone = "primary" | "info" | "success";

export interface EmptyWorkspaceStep {
  /** Translation key for the step heading. */
  title: string;
  /** Translation key for the sentence under it. */
  detail: string;
  icon: string;
  tone?: EmptyWorkspaceTone;
  link: LinkRendererConfig;
  /** Permission this step needs. The engine strips the entry server-side when
   * the user fails it, so a recruiter is never pointed at a client form. */
  access?: { resource: string; action?: string[] };
}

export interface EmptyWorkspaceRendererConfig {
  icon: string;
  /** Translation key for the headline. */
  title: string;
  /** Translation key for the paragraph under it. */
  description: string;
  steps: EmptyWorkspaceStep[];
  /** Render only when this path on the fetched record is truthy. */
  showPath?: string;
}

/**
 * The first-run dashboard. Every figure on this screen is a count of work that
 * has moved, so a workspace with no clients, roles or candidates has nothing to
 * report — the design replaces the numbers with the three things that start
 * them. `showPath` is the API's own verdict on whether the workspace is new.
 */
export function EmptyWorkspaceRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<EmptyWorkspaceRendererConfig>(id);
  const { data } = useFetch<Record<string, unknown>>(id, {
    data: seedRecord<Record<string, unknown>>(undefined),
  });
  const row = data ?? {};

  if (!config) return null;
  if (config.showPath && !row[config.showPath]) return null;
  const steps = config.steps ?? [];

  return (
    <Card
      variant="base"
      data-testid={`empty-workspace-${id}`}
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        px: "32px",
        py: "44px",
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: "999px",
          bgcolor: "surface.primarySoftBg",
          color: "surface.primarySoftFg",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <IconRenderer name={config.icon} size={32} color="inherit" />
      </Box>
      <Typography
        sx={{
          fontFamily: "var(--font-manrope), 'Manrope', ui-sans-serif, sans-serif",
          fontSize: 22,
          fontWeight: 700,
          letterSpacing: "-.01em",
          mt: "18px",
        }}
      >
        {t(config.title)}
      </Typography>
      <Typography
        sx={{
          fontSize: 13,
          lineHeight: 1.65,
          color: "text.secondary",
          maxWidth: "52ch",
          mt: "8px",
        }}
      >
        {t(config.description)}
      </Typography>
      {steps.length ? (
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(212px,1fr))",
            gap: "12px",
            width: "100%",
            maxWidth: 720,
            textAlign: "left",
            mt: "26px",
          }}
        >
          {steps.map((step, index) => (
            <StepTile key={step.title} step={step} index={index} t={t} />
          ))}
        </Box>
      ) : null}
    </Card>
  );
}

function StepTile({
  step,
  index,
  t,
}: {
  step: EmptyWorkspaceStep;
  index: number;
  t: (key: string) => string;
}) {
  const tone = step.tone ?? (["primary", "info", "success"] as const)[index % 3];

  return (
    <LinkRenderer config={{ ...step.link, underline: "none" }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          p: "16px",
          borderRadius: "12px",
          bgcolor: "surface.inset",
          border: "1px solid transparent",
          color: "text.primary",
          transition: "var(--recruit-motion-state)",
          "&:hover": { borderColor: "primary.main" },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: "9px" }}>
          <Box
            sx={{
              width: 22,
              height: 22,
              borderRadius: "999px",
              bgcolor: TONE_BG[tone],
              color: TONE_FG[tone],
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 11,
              fontWeight: 800,
              flex: "none",
            }}
          >
            {index + 1}
          </Box>
          <IconRenderer name={step.icon} size={18} color={TONE_FG[tone]} />
        </Box>
        <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{t(step.title)}</Typography>
        <Typography sx={{ fontSize: 11.5, lineHeight: 1.6, color: "text.secondary" }}>
          {t(step.detail)}
        </Typography>
      </Box>
    </LinkRenderer>
  );
}
