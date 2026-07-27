"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { seedRecord } from "../../utils/seed-data";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";

export type MessageAlertTone = "accent" | "info" | "success" | "warning" | "error";

export interface MessageAlertRendererConfig {
  /** `accent` is the orange insight strip; the rest map to Alert severities. */
  tone?: MessageAlertTone;
  /** ICON_REGISTRY name; falls back to the tone's default Alert icon. */
  icon?: string;
  /** Bold lead-in ("AI insight:"). Translation key. */
  prefix?: { name: string };
  /** Body text. Translation key, interpolated with the data row via `{{token}}`. */
  message: { name: string };
  /** Trailing bold call-to-action with an arrow. Translation key. */
  cta?: { name: string };
  /** Data values that are translation keys, resolved before interpolation:
   * token → where to read it and the key prefix to resolve it under. Mirrors
   * FunnelRenderer's `stageLabelPrefix`, e.g.
   * `{ stage: { path: "bottleneckStage", prefix: "stages." } }`. */
  translateValues?: Record<string, { path: string; prefix?: string }>;
  /** Wraps the whole strip in a link. */
  link?: LinkRendererConfig;
  /** Render only when this data path is a non-zero, non-empty value — so an
   * alert about a condition disappears when the condition clears. */
  showPath?: string;
}

type T = (key: string, vars?: Record<string, unknown>) => string;

export function MessageAlertRenderer({
  id,
  config: configProp,
  data: dataProp,
}: {
  id: string;
  config?: MessageAlertRendererConfig;
  data?: Record<string, unknown>;
}) {
  const configFromId = useConfiguration<MessageAlertRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { t } = useTranslation(id) as { t: T };
  const seedData = seedRecord(dataProp);
  const { data: resolved } = useFetch<Record<string, unknown>>(id, { data: seedData });
  const data = resolved ?? {};

  if (!config?.message) return null;
  if (config.showPath) {
    const gate = delve(data, config.showPath);
    if (!gate || gate === "0") return null;
  }

  const vars: Record<string, unknown> = { ...data };
  for (const [token, source] of Object.entries(config.translateValues ?? {})) {
    const key = String(delve(data, source.path) ?? "");
    if (key) vars[token] = t(`${source.prefix ?? ""}${key}`);
  }

  const tone = config.tone ?? "accent";
  // On the accent strip only the icon, prefix and CTA carry the accent — the
  // sentence itself is muted body text, per the design. Severity tones keep the
  // Alert's single colour, which is how the rest of the app reads them.
  const alert = (
    <Alert
      {...(tone === "accent" ? { variant: "accent" as const } : { severity: tone })}
      icon={config.icon ? <IconRenderer name={config.icon} size={16} color="inherit" /> : undefined}
      sx={{ "& .MuiAlert-message": { flex: 1 } }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: "11px" }}>
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            lineHeight: 1.5,
            ...(tone === "accent" ? { color: "surface.textMuted" } : {}),
          }}
        >
          {config.prefix ? (
            <Box
              component="b"
              sx={{
                fontWeight: 700,
                mr: "5px",
                ...(tone === "accent" ? { color: "surface.primarySoftFg" } : {}),
              }}
            >
              {t(config.prefix.name)}
            </Box>
          ) : null}
          {t(config.message.name, vars)}
        </Box>
        {config.cta ? (
          <Box
            sx={{
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              gap: "4px",
              fontSize: 12,
              fontWeight: 700,
            }}
          >
            {t(config.cta.name, vars)}
            <IconRenderer name="arrow-forward" size={13} color="inherit" />
          </Box>
        ) : null}
      </Box>
    </Alert>
  );

  if (!config.link) return alert;
  return (
    <LinkRenderer config={{ ...config.link, sx: { display: "block", ...config.link.sx } }}>
      {alert}
    </LinkRenderer>
  );
}
