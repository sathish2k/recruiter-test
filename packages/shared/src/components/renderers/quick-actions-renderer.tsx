"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Typography from "@mui/material/Typography";
import { useConfiguration, useTranslation } from "@recruit/sdk";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";
import { TONE_BG, TONE_FG } from "./tones";

export type ActionTone = "primary" | "success" | "warning" | "error" | "info" | "violet";

export interface QuickActionsRendererConfig {
  /** Translation key for the card heading. Omit for a bare tile row. */
  title?: string;
  /** Minimum tile width before the grid wraps. */
  minWidth?: number;
  /** The design's second tier — "RUNNING THE BUSINESS" under a dashed rule.
   * A plain list, not tiles: these are places you go, not things you make. */
  secondary?: {
    /** Translation key for the small caps caption. */
    label: string;
    actions: {
      label: string;
      icon: string;
      link: LinkRendererConfig;
      access?: { resource: string; action?: string[] };
    }[];
  };
  actions: {
    /** Translation key. */
    label: string;
    icon: string;
    tone?: ActionTone;
    link: LinkRendererConfig;
    /** Permission this action needs. The engine removes the entry server-side
     * when the user fails it, so the component never sees it. */
    access?: { resource: string; action?: string[] };
  }[];
}

/**
 * The design's quick-action tiles. Which actions appear is a permission
 * question: each entry in `actions` carries its own `access` rule in the
 * configuration, and the engine has already stripped the ones this user cannot
 * perform before the component ever sees the list.
 */
export function QuickActionsRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<QuickActionsRendererConfig>(id);
  const actions = config?.actions ?? [];
  if (!actions.length) return null;

  return (
    <Card variant="base" data-testid={`quick-actions-${id}`}>
      {config?.title ? (
        <Typography sx={{ fontSize: 15, fontWeight: 700, mb: "14px" }}>
          {t(config.title)}
        </Typography>
      ) : null}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: config?.minWidth
            ? `repeat(auto-fit,minmax(${config.minWidth}px,1fr))`
            : "1fr 1fr",
          gap: "12px",
        }}
      >
        {actions.map((action) => (
          <LinkRenderer key={action.label} config={{ ...action.link, underline: "none" }}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: "9px",
                p: "14px",
                borderRadius: "10px",
                bgcolor: "surface.inset",
                color: "text.primary",
                cursor: "pointer",
                transition: "var(--recruit-motion-state)",
                "&:hover": { bgcolor: "surface.hover" },
              }}
            >
              <IconRenderer
                name={action.icon}
                size={20}
                color={TONE_FG[action.tone ?? "primary"]}
              />
              <Typography sx={{ fontSize: 12.5, fontWeight: 700, lineHeight: 1.4, minWidth: 0 }}>
                {t(action.label)}
              </Typography>
            </Box>
          </LinkRenderer>
        ))}
      </Box>
      {config?.secondary?.actions?.length ? (
        <Box
          sx={{
            mt: "14px",
            pt: "12px",
            borderTop: "1px dashed",
            borderColor: "surface.divider",
          }}
        >
          <Typography
            sx={{
              fontSize: 9.5,
              fontWeight: 800,
              letterSpacing: ".09em",
              color: "text.disabled",
              mb: "8px",
            }}
          >
            {t(config.secondary.label)}
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {config.secondary.actions.map((action) => (
              <LinkRenderer key={action.label} config={{ ...action.link, underline: "none" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    p: "8px 9px",
                    borderRadius: "8px",
                    color: "text.secondary",
                    cursor: "pointer",
                    "&:hover": { bgcolor: "surface.hover", color: "text.primary" },
                  }}
                >
                  <IconRenderer name={action.icon} size={17} color="inherit" />
                  <Typography sx={{ fontSize: 12.5, fontWeight: 600 }}>
                    {t(action.label)}
                  </Typography>
                </Box>
              </LinkRenderer>
            ))}
          </Box>
        </Box>
      ) : null}
    </Card>
  );
}
