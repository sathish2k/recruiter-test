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
  /** Icon-tile glyph (see ICON_REGISTRY). */
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
    bg: "rgba(242,106,27,.1)",
    border: "rgba(242,106,27,.24)",
    icon: "#F0B27C",
  },
  neutral: {
    bg: "rgba(255,255,255,.04)",
    border: "rgba(255,255,255,.07)",
    icon: "#8A6A4E",
  },
  blue: {
    bg: "rgba(122,162,247,.1)",
    border: "rgba(122,162,247,.24)",
    icon: "#9DB8F0",
  },
  green: {
    bg: "rgba(78,168,116,.12)",
    border: "rgba(78,168,116,.26)",
    icon: "#8FD6AC",
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
      <Typography
        sx={{
          fontSize: compact ? 14 : 16,
          fontWeight: 700,
          color: "#ECEAE7",
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
