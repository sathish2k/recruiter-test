"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { seedRows } from "../../utils/seed-data";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";
import { TONE_BG, TONE_FG } from "./tones";

export type SideTone = "primary" | "success" | "warning" | "error" | "info" | "violet" | "muted";

export interface SideListRendererConfig {
  /** Translation keys for the card header. */
  title: string;
  subtitle?: string;
  /** "View all" link on the header row. */
  viewAll?: LinkRendererConfig & { viewAllLabel: string };
  /** Badge corner radius: the design rounds people and squares records. */
  badgeShape?: "pill" | "rounded" | "square";
  paths?: {
    badge?: string;
    /** Renders a tone-tinted glyph in the tile instead of the badge text — the
     * design draws records (activity, recently viewed) with an icon and people
     * with their initials. */
    icon?: string;
    title?: string;
    subtitle?: string;
    value?: string;
    tone?: string;
    /** Second line of chips: [{ label, tone }] plus a trailing plain note. */
    meta?: string;
    note?: string;
  };
  limit?: number;
}

interface MetaChip {
  label: string;
  tone?: SideTone;
}

const RADIUS = { pill: "999px", rounded: "10px", square: "8px" };

/**
 * The context card beside the queue. Every role gets one and every role's is
 * different — Top clients, Recent security events, Team performance, Today,
 * Jobs assigned, Why profiles are rejected — but they are the same shape: a
 * badge, two lines, a figure on the right, and an optional chip row underneath.
 * So it is one component driven entirely by paths.
 */
export function SideListRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<SideListRendererConfig>(id);
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
      data-testid={`side-list-${id}`}
      sx={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontSize: 15, fontWeight: 700 }}>{t(config.title)}</Typography>
          {config.subtitle ? (
            <Typography sx={{ fontSize: 11.5, color: "text.secondary", mt: "2px" }}>
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

      <Box sx={{ display: "flex", flexDirection: "column", mt: "12px" }}>
        {isLoading && !shown.length
          ? Array.from({ length: Math.min(config.limit ?? 4, 5) }, (_, index) => (
              <Box
                // biome-ignore lint/suspicious/noArrayIndexKey: placeholder rows have no identity.
                key={index}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  py: "11px",
                  borderBottom: "1px dashed",
                  borderColor: "surface.divider",
                }}
              >
                <Skeleton variant="rounded" width={32} height={32} sx={{ flex: "none" }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="60%" height={16} />
                  <Skeleton variant="text" width="40%" height={13} />
                </Box>
              </Box>
            ))
          : null}
        {shown.map((row, index) => {
          const tone = (delve(row, paths.tone ?? "tone") ?? "primary") as SideTone;
          // A renderer must not take the page down over a shape it did not
          // expect: a scalar here reads as a note, anything else as no chips.
          const rawMeta = delve(row, paths.meta ?? "meta");
          const meta = (Array.isArray(rawMeta) ? rawMeta : []) as MetaChip[];
          const note = paths.note ? delve(row, paths.note) : undefined;
          const title = String(delve(row, paths.title ?? "title") ?? "");
          return (
            <Box
              key={String(delve(row, "id") ?? title ?? index)}
              sx={{
                py: "11px",
                ...(index === shown.length - 1
                  ? {}
                  : { borderBottom: "1px dashed", borderColor: "surface.divider" }),
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    flex: "none",
                    borderRadius: RADIUS[config.badgeShape ?? "rounded"],
                    bgcolor: TONE_BG[tone],
                    color: TONE_FG[tone],
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 10.5,
                    fontWeight: 700,
                  }}
                >
                  {paths.icon && delve(row, paths.icon) ? (
                    <IconRenderer name={String(delve(row, paths.icon))} size={16} color="inherit" />
                  ) : (
                    String(delve(row, paths.badge ?? "badge") ?? "")
                  )}
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography noWrap sx={{ fontSize: 12.5, fontWeight: 700 }}>
                    {t(title, row)}
                  </Typography>
                  <Typography noWrap sx={{ fontSize: 11, color: "text.secondary", mt: "1px" }}>
                    {t(String(delve(row, paths.subtitle ?? "subtitle") ?? ""), row)}
                  </Typography>
                </Box>
                <Typography
                  sx={{ fontSize: 12, fontWeight: 700, color: TONE_FG[tone], flex: "none" }}
                >
                  {String(delve(row, paths.value ?? "value") ?? "")}
                </Typography>
              </Box>

              {meta.length || note ? (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    flexWrap: "wrap",
                    m: "7px 0 0 44px",
                  }}
                >
                  {meta.map((chip) => (
                    <Box
                      key={chip.label}
                      sx={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 21,
                        px: "8px",
                        borderRadius: "6px",
                        bgcolor: TONE_BG[chip.tone ?? "muted"],
                        color: TONE_FG[chip.tone ?? "muted"],
                        fontSize: 10.5,
                        fontWeight: 700,
                      }}
                    >
                      {chip.label}
                    </Box>
                  ))}
                  {note ? (
                    <Typography
                      sx={{
                        fontSize: 10.5,
                        color: "text.secondary",
                        fontVariantNumeric: "tabular-nums",
                      }}
                    >
                      {String(note)}
                    </Typography>
                  ) : null}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Card>
  );
}
