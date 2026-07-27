"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useAuthUser, useFetch, useTranslation } from "@recruit/sdk";
import { IconRenderer, LinkRenderer, seedRecord } from "@recruit/shared";
import delve from "dlv";
import type { DashboardWelcomeConfig, WelcomeHighlight } from "./dashboard-welcome.configuration";

const TONE_COLOR = {
  accent: "primary",
  neutral: "default",
  warning: "warning",
} as const;

function greetingKey(config: DashboardWelcomeConfig) {
  const hour = new Date().getHours();
  if (hour < 12) return config.greeting.morning;
  if (hour < 18) return config.greeting.afternoon;
  return config.greeting.evening;
}

function firstName(name?: string | null) {
  return (name ?? "").trim().split(/\s+/)[0] ?? "";
}

export function DashboardWelcomeComponent({
  id,
  configuration,
  data: seed,
}: {
  id: string;
  configuration?: DashboardWelcomeConfig;
  data?: Record<string, unknown>;
}) {
  const { t } = useTranslation(id);
  const user = useAuthUser();
  const { data, isLoading } = useFetch<Record<string, unknown>>(id, { data: seedRecord(seed) });
  const summary = data ?? {};

  if (!configuration) return null;

  const name = firstName(user?.name);
  const greeting = t(greetingKey(configuration));
  const shown = configuration.highlights.filter(
    (highlight) => Number(delve(summary, highlight.path) ?? 0) > 0,
  );

  return (
    <Box>
      <Typography
        suppressHydrationWarning
        sx={{
          fontFamily: "var(--font-manrope), 'Manrope', ui-sans-serif, sans-serif",
          fontSize: 23,
          fontWeight: 700,
          letterSpacing: "-.02em",
        }}
      >
        {name ? `${greeting}, ${name}` : greeting}
      </Typography>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          flexWrap: "wrap",
          mt: "9px",
          minHeight: 26,
        }}
      >
        {isLoading ? (
          <Skeleton variant="rounded" width={220} height={22} sx={{ borderRadius: "999px" }} />
        ) : shown.length === 0 ? (
          <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
            {t(configuration.emptyLead)}
          </Typography>
        ) : (
          <>
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>
              {t(configuration.lead)}
            </Typography>
            {shown.map((highlight) => (
              <HighlightChip key={highlight.path} config={highlight} data={summary} t={t} />
            ))}
          </>
        )}
      </Box>
    </Box>
  );
}

function HighlightChip({
  config,
  data,
  t,
}: {
  config: WelcomeHighlight;
  data: Record<string, unknown>;
  t: (key: string, vars?: Record<string, unknown>) => string;
}) {
  const chip = (
    <Chip
      variant="pill"
      color={TONE_COLOR[config.tone ?? "neutral"]}
      icon={<IconRenderer name={config.icon} size={13} color="inherit" />}
      label={t(config.label, { value: delve(data, config.path) })}
      sx={{ cursor: config.link ? "pointer" : "default" }}
    />
  );
  if (!config.link) return chip;
  return <LinkRenderer config={config.link}>{chip}</LinkRenderer>;
}
