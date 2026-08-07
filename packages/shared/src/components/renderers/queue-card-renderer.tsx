"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { seedRows } from "../../utils/seed-data";
import { EmptyStateRenderer } from "./empty-state-renderer";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";
import { TONE_BG, TONE_FG } from "./tones";

/** Row tones. The stripe, badge tint and tag all resolve from this one value,
 * so a row says "late" once rather than three times. */
export type QueueTone = "primary" | "success" | "warning" | "error" | "info" | "violet" | "muted";

export interface QueueCardRendererConfig {
  /** Translation keys for the card header. */
  title: string;
  subtitle?: string;
  /** "View all" link in the header. */
  viewAll?: LinkRendererConfig & { viewAllLabel: string };
  /** Data paths on each row. Everything is a path so one renderer serves every
   * role's queue — risks, approvals, sourcing follow-ups. */
  paths?: {
    badge?: string;
    title?: string;
    subtitle?: string;
    tag?: string;
    tone?: string;
    /** Chips under the subtitle: [{ label, icon, tone }]. */
    meta?: string;
  };
  /** Badge corner radius. The design rounds people (pill) and squares records. */
  badgeShape?: "pill" | "rounded";
  /** Row action. `labelPath` lets the API name the verb per row. */
  action?: LinkRendererConfig & { actionLabel?: string; labelPath?: string };
  /** Rendered when the queue is empty — an empty queue is good news, so it
   * gets a state of its own rather than a blank card. `title`/`description`
   * are translation keys. */
  empty?: { icon: string; title: string; description: string };
  /** Rows to show before the card scrolls. */
  limit?: number;
}

interface MetaChip {
  label: string;
  icon?: string;
  tone?: QueueTone;
}

/**
 * The design's decision queue: one row per thing waiting on the person looking
 * at it, carrying a stripe, a badge, a tag and a single action. Which queue a
 * user sees is a permission question answered by the page configuration; this
 * component only renders the rows its datasource returns.
 */
export function QueueCardRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<QueueCardRendererConfig>(id);
  const { data, isLoading } = useFetch<Record<string, unknown>[]>(id, {
    data: seedRows<Record<string, unknown>>(undefined),
  });
  const rows = Array.isArray(data) ? data : [];
  if (!config) return null;

  const paths = config.paths ?? {};
  const shown = config.limit ? rows.slice(0, config.limit) : rows;

  return (
    <Card
      variant="base"
      data-testid={`queue-card-${id}`}
      sx={{ p: 0, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
          p: "18px 20px 14px",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t(config.title)}</Typography>
          {config.subtitle ? (
            <Typography sx={{ fontSize: 12, color: "text.secondary", mt: "2px" }}>
              {t(config.subtitle)}
            </Typography>
          ) : null}
        </Box>
        {config.viewAll ? (
          <LinkRenderer
            config={{
              ...config.viewAll,
              text: t(config.viewAll.viewAllLabel),
              sx: { fontSize: 12.5, fontWeight: 700, flex: "none" },
            }}
          />
        ) : null}
      </Box>

      {isLoading ? (
        <Box sx={{ p: "0 20px 20px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {[0, 1, 2].map((row) => (
            <Skeleton key={row} variant="rounded" height={56} />
          ))}
        </Box>
      ) : shown.length === 0 && config.empty ? (
        <Box sx={{ p: "8px 20px 24px" }}>
          <EmptyStateRenderer
            config={{
              icon: config.empty.icon,
              title: config.empty.title,
              description: config.empty.description,
              tone: "green",
              compact: true,
            }}
            t={t}
          />
        </Box>
      ) : (
        shown.map((row, index) => {
          const tone = (delve(row, paths.tone ?? "tone") ?? "primary") as QueueTone;
          const meta = (delve(row, paths.meta ?? "meta") ?? []) as MetaChip[];
          const tag = paths.tag ? delve(row, paths.tag) : undefined;
          const actionLabel = config.action?.labelPath
            ? delve(row, config.action.labelPath)
            : config.action?.actionLabel
              ? t(config.action.actionLabel)
              : undefined;
          return (
            <Box
              // Rows carry an id from the API; the index is the fallback for
              // aggregate rows that have none.
              key={String(delve(row, "id") ?? index)}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                p: "14px 20px 14px 17px",
                borderTop: "1px dashed",
                borderTopColor: "surface.divider",
                borderLeft: "3px solid",
                borderLeftColor: TONE_FG[tone],
                transition: "var(--recruit-motion-state)",
                "&:hover": { bgcolor: "surface.hover" },
              }}
            >
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  flex: "none",
                  borderRadius: config.badgeShape === "pill" ? "999px" : "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11.5,
                  fontWeight: 700,
                  bgcolor: TONE_BG[tone],
                  color: TONE_FG[tone],
                }}
              >
                {String(delve(row, paths.badge ?? "badge") ?? "")}
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography noWrap sx={{ fontSize: 13.5, fontWeight: 700 }}>
                  {t(String(delve(row, paths.title ?? "title") ?? ""), row)}
                </Typography>
                <Typography noWrap sx={{ fontSize: 11.5, color: "text.secondary", mt: "2px" }}>
                  {t(String(delve(row, paths.subtitle ?? "subtitle") ?? ""), row)}
                </Typography>
                {meta.length ? (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      flexWrap: "wrap",
                      mt: "6px",
                    }}
                  >
                    {meta.map((chip) => (
                      <Box
                        key={chip.label}
                        sx={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          height: 21,
                          px: "8px",
                          borderRadius: "6px",
                          fontSize: 10.5,
                          fontWeight: 700,
                          bgcolor: TONE_BG[chip.tone ?? "muted"],
                          color: TONE_FG[chip.tone ?? "muted"],
                        }}
                      >
                        {chip.icon ? (
                          <IconRenderer name={chip.icon} size={13} color="inherit" />
                        ) : null}
                        {chip.label}
                      </Box>
                    ))}
                  </Box>
                ) : null}
              </Box>

              {tag ? (
                <Box
                  sx={{
                    flex: "none",
                    px: "9px",
                    py: "3px",
                    borderRadius: "6px",
                    fontSize: 11,
                    fontWeight: 700,
                    bgcolor: TONE_BG[tone],
                    color: TONE_FG[tone],
                  }}
                >
                  {t(String(tag), row)}
                </Box>
              ) : null}

              {config.action && actionLabel ? (
                <LinkRenderer
                  config={{
                    ...config.action,
                    params: { id: { type: "static", value: String(delve(row, "id") ?? "") } },
                  }}
                >
                  <Button variant="outlined" size="small" sx={{ flex: "none" }}>
                    {t(String(actionLabel), row)}
                  </Button>
                </LinkRenderer>
              ) : null}
            </Box>
          );
        })
      )}
    </Card>
  );
}
