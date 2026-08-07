"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { usePortalRouter } from "@recruit/sdk";
import { IconRenderer } from "./icon-renderer";

export type EmptyStateTone = "primary" | "neutral" | "blue" | "green";

export interface EmptyStateAction {
  /** Translation key for the button label. */
  text: string;
  /** Navigate to this route id on click. */
  routeId?: string;
  /** Navigate to this href on click. */
  href?: string;
  /** Emit this key to the host `onAction` handler on click (e.g. open a modal). */
  action?: string;
  variant?: "contained" | "outlined";
  /** Leading icon (see ICON_REGISTRY). */
  icon?: string;
}

export interface EmptyStateConfig {
  /**
   * Spot illustration from `/illustrations` (name without the extension), for
   * the full-size state. Drawn at 160px on a 320×240 canvas.
   *
   * Ignored when `compact` is set: below ~96px the mark's kerfs close up and
   * the scene turns to mud, so a dense rail widget keeps the icon tile. That
   * is the design's own rule, not a shortcut.
   */
  illustration?: string;
  /** Icon-tile glyph (see ICON_REGISTRY). The fallback, and the compact form. */
  icon: string;
  /** Heading translation key. */
  title: string;
  /** Subtext translation key. */
  description: string;
  /** Tile/icon color family. */
  tone?: EmptyStateTone;
  /** Compact treatment for rail widgets (smaller tile, no action row). */
  compact?: boolean;
  actions?: EmptyStateAction[];
}

type TFunc = (key: string, vars?: string | Record<string, unknown>) => string;

const TONES: Record<EmptyStateTone, { bg: string; border: string; icon: string }> = {
  primary: {
    bg: "var(--mui-palette-surface-primarySoftBg)",
    border: "var(--mui-palette-surface-primarySoftBorder)",
    icon: "var(--mui-palette-surface-primarySoftFg)",
  },
  neutral: {
    bg: "var(--mui-palette-surface-headBg)",
    border: "var(--mui-palette-surface-tint)",
    icon: "var(--mui-palette-text-disabled)",
  },
  blue: {
    bg: "var(--mui-palette-surface-infoSoftBg)",
    border: "var(--mui-palette-surface-infoSoftBorder)",
    icon: "var(--mui-palette-info-light)",
  },
  green: {
    bg: "var(--mui-palette-surface-successSoftBg)",
    border: "var(--mui-palette-surface-successSoftBorder)",
    icon: "var(--mui-palette-success-light)",
  },
};

export function EmptyStateRenderer({
  config,
  t,
  onAction,
}: {
  config: EmptyStateConfig;
  t: TFunc;
  onAction?: (action: string) => void;
}) {
  const router = usePortalRouter();
  const tone = TONES[config.tone ?? "primary"];
  const compact = Boolean(config.compact);
  const tileSize = compact ? 46 : 62;
  const iconSize = compact ? 22 : 28;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: compact ? "8px" : "12px",
        px: "16px",
        py: compact ? "18px" : "44px",
      }}
    >
      {config.illustration && !compact ? (
        <Box
          component="img"
          src={`/illustrations/${config.illustration}.svg`}
          alt=""
          sx={{ width: 160, height: 120, objectFit: "contain" }}
        />
      ) : (
        <Box
          sx={{
            width: tileSize,
            height: tileSize,
            borderRadius: compact ? "13px" : "16px",
            bgcolor: tone.bg,
            border: "1px solid",
            borderColor: tone.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconRenderer name={config.icon} size={iconSize} color={tone.icon} />
        </Box>
      )}
      <Typography
        sx={{
          fontSize: compact ? 14 : 16,
          fontWeight: 700,
          color: "text.primary",
          mt: compact ? 0 : "4px",
        }}
      >
        {t(config.title)}
      </Typography>
      <Typography
        sx={{
          fontSize: compact ? 12 : 13,
          color: "text.secondary",
          maxWidth: compact ? 240 : 400,
          lineHeight: 1.55,
        }}
      >
        {t(config.description)}
      </Typography>
      {!compact && config.actions?.length ? (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            mt: "8px",
          }}
        >
          {config.actions.map((cta) => (
            <Button
              key={cta.text}
              variant={cta.variant ?? "contained"}
              onClick={() => {
                if (cta.routeId) router.push(cta.routeId);
                else if (cta.href) window.location.assign(cta.href);
                else if (cta.action) onAction?.(cta.action);
              }}
              startIcon={cta.icon ? <IconRenderer name={cta.icon} size={16} /> : undefined}
            >
              {t(cta.text)}
            </Button>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
