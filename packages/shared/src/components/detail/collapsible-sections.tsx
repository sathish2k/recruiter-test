"use client";

import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { useState } from "react";
import { MarkdownPreview } from "../forms/markdown/markdown";
import { IconRenderer } from "../renderers/icon-renderer";

/**
 * One collapsible block of a detail screen's body — the requirement's
 * description, its qualifications and its skills all read the same way: a
 * header you can fold, a count beside the title, and a body whose shape is
 * declared rather than coded.
 */
export interface CollapsibleSectionConfig {
  /** Translation key for the header. */
  title: string;
  /** Data path for the body. */
  path: string;
  /** `markdown` renders prose, `bullets` splits the same markdown into a list,
   * and `chips` renders a string array as pills. */
  kind?: "markdown" | "bullets" | "chips";
  /** Show the item count beside the title (bullets and chips). */
  showCount?: boolean;
  /** Folded state on first render. */
  defaultOpen?: boolean;
  /** Shown in place of an empty body. */
  emptyText?: string;
  /** Dimmed note on the right of the header. */
  hint?: string;
}

const lines = (value: unknown) =>
  String(value ?? "")
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter(Boolean);

const items = (config: CollapsibleSectionConfig, data: Record<string, unknown>) => {
  const raw = delve(data, config.path);
  if (config.kind === "chips") return Array.isArray(raw) ? raw.map(String) : [];
  if (config.kind === "bullets") return lines(raw);
  return String(raw ?? "").trim() ? [String(raw)] : [];
};

function Section({
  config,
  data,
  t,
}: {
  config: CollapsibleSectionConfig;
  data: Record<string, unknown>;
  t: (key: string, fallback?: string | Record<string, unknown>) => string;
}) {
  const [open, setOpen] = useState(config.defaultOpen ?? true);
  const values = items(config, data);

  return (
    <Card variant="base" sx={{ overflow: "hidden" }}>
      <Box
        component="button"
        type="button"
        onClick={() => setOpen((current) => !current)}
        sx={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "10px",
          p: "14px 18px",
          background: "none",
          border: 0,
          cursor: "pointer",
          color: "inherit",
          textAlign: "left",
          "&:hover": { bgcolor: "surface.hover" },
        }}
      >
        <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>
          {t(config.title)}
          {config.showCount && values.length ? (
            <Box component="span" sx={{ fontWeight: 400, color: "text.disabled", fontSize: 12 }}>
              {` · ${values.length}`}
            </Box>
          ) : null}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px", color: "text.disabled" }}>
          {config.hint ? (
            <Typography sx={{ fontSize: 12, color: "text.disabled" }}>{t(config.hint)}</Typography>
          ) : null}
          <IconRenderer name={open ? "expand-less" : "expand-more"} size={18} />
        </Box>
      </Box>

      {open ? (
        <Box sx={{ p: "0 18px 16px" }}>
          {values.length === 0 ? (
            <Typography sx={{ fontSize: 13, color: "text.disabled" }}>
              {t(config.emptyText ?? "")}
            </Typography>
          ) : config.kind === "chips" ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {values.map((value) => (
                <Chip key={value} variant="soft" label={value} />
              ))}
            </Box>
          ) : config.kind === "bullets" ? (
            <Box
              component="ul"
              sx={{
                m: 0,
                pl: "22px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
                fontSize: 14,
                lineHeight: 1.6,
                color: "text.secondary",
                maxWidth: 840,
              }}
            >
              {values.map((value) => (
                <li key={value}>{value}</li>
              ))}
            </Box>
          ) : (
            <Box sx={{ fontSize: 14, lineHeight: 1.7, color: "text.secondary", maxWidth: 840 }}>
              <MarkdownPreview value={values[0] ?? ""} />
            </Box>
          )}
        </Box>
      ) : null}
    </Card>
  );
}

/**
 * The stack of foldable body sections. Bound straight to a component id: the
 * configuration is the section list and the datasource is the record, so a new
 * section is a config entry rather than a component.
 */
export function CollapsibleSectionsRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<CollapsibleSectionConfig[]>(id);
  const params = useRouteParams();
  const { data, isLoading } = useFetch<Record<string, unknown>>(id, { filters: { id: params.id } });

  if (!config?.length) return null;
  if (isLoading || !data) {
    return (
      <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {config.map((section) => (
          <Skeleton
            key={section.title}
            variant="rounded"
            height={54}
            sx={{ borderRadius: "14px" }}
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      {config.map((section) => (
        <Section key={section.title} config={section} data={data} t={t} />
      ))}
    </Box>
  );
}
