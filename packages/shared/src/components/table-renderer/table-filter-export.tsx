"use client";

import AddRounded from "@mui/icons-material/AddRounded";
import FileDownloadOutlined from "@mui/icons-material/FileDownloadOutlined";
import UploadFileRounded from "@mui/icons-material/UploadFileRounded";
import Box from "@mui/material/Box";
import {
  useConfiguration,
  useFetch,
  usePortalRouter,
  useTranslation,
} from "@recruit/sdk";
import type { ReactNode } from "react";
import { Export } from "../export";
import { type FilterConfig, Filters, useFilters } from "../filters";
import type { ActionHandler } from "../renderers";
import { TableRenderer } from "./table-renderer";
import type { TableCta, TableFilterExportConfig } from "./table-renderer.types";

type Row = Record<string, unknown>;

const CTA_ICONS: Record<string, ReactNode> = {
  add: <AddRounded sx={{ fontSize: 18 }} />,
  download: <FileDownloadOutlined sx={{ fontSize: 16 }} />,
  upload: <UploadFileRounded sx={{ fontSize: 16 }} />,
};

// TableRenderer with a toolbar: config-driven Filters (URL-synced, server-side
// via useFetch), CTA buttons, and an Export button. `id` drives config, data
// and translations; `onCta` handles CTAs that use `action` instead of `routeId`.
export function TableFilterExportRenderer({
  id,
  config: configProp,
  onCta,
  actionHandler,
}: {
  id: string;
  config?: TableFilterExportConfig;
  onCta?: (action: string) => void;
  actionHandler?: ActionHandler;
}) {
  const { t } = useTranslation(id);
  const configFromId = useConfiguration<TableFilterExportConfig>(id);
  const config = configProp ?? configFromId;
  const router = usePortalRouter();
  const { filters } = useFilters();

  // The table fetches its own paged/sorted data (server-side) from `filters`.
  // This fetch is the full filtered set (no pagination) used only for Export.
  const { data } = useFetch<Row[]>(id, { filters });
  const exportRows = data ?? [];

  // Resolve the filter config's translation keys (labels/placeholders).
  const filterOptions: FilterConfig[] = (config?.filters ?? []).map((f) => {
    const label = f.label ? { name: t(f.label.name) } : undefined;
    if ("options" in f) {
      return {
        ...f,
        label,
        options: f.options.map((o) => ({ ...o, label: t(o.label) })),
      };
    }
    if (f.type === "search") {
      return {
        ...f,
        label,
        placeholder: f.placeholder ? t(f.placeholder) : undefined,
      };
    }
    return { ...f, label };
  });

  const handleCta = (cta: TableCta) => {
    if (cta.routeId) router.push(cta.routeId);
    else if (cta.action) onCta?.(cta.action);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {config?.filters ? (
            <Filters
              options={filterOptions}
              responsive
              showClearAll
              moreLabel={t("moreFilters", "Filters")}
            />
          ) : null}
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            flex: "none",
          }}
        >
          {config?.export ? (
            <Export
              id={id}
              config={config.export}
              data={exportRows}
              filename={config.exportFilename ?? id}
            />
          ) : null}
          {(config?.ctas ?? []).map((cta) => {
            const primary = cta.variant !== "secondary";
            return (
              <Box
                key={cta.label.name}
                onClick={() => handleCta(cta)}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  px: "16px",
                  py: "9px",
                  borderRadius: "999px",
                  fontSize: 13,
                  fontWeight: primary ? 600 : 400,
                  cursor: "pointer",
                  ...(primary
                    ? {
                        background: "linear-gradient(135deg,#FF8A3C,#E4560F)",
                        color: "#fff",
                        "&:hover": { filter: "brightness(1.08)" },
                      }
                    : {
                        border: "1px solid rgba(255,255,255,.14)",
                        "&:hover": { background: "rgba(255,255,255,.06)" },
                      }),
                }}
              >
                {cta.icon ? CTA_ICONS[cta.icon] : null}
                {t(cta.label.name)}
              </Box>
            );
          })}
        </Box>
      </Box>

      <TableRenderer
        id={id}
        config={config}
        filters={filters}
        actionHandler={actionHandler}
      />
    </Box>
  );
}
