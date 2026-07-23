"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import {
  Export,
  type FilterConfig,
  Filters,
  IconRenderer,
  Modal,
  useFilters,
  useToast,
} from "@recruit/shared";
import { useMemo, useState } from "react";
import { SectionCard } from "../ui";
import type { AuditLogConfig } from "./audit-log.configuration";

interface AuditEvent {
  id: string;
  event: string;
  category: string;
  severity: "success" | "warning" | "failure";
  user: string;
  ip: string;
  when: string;
  absolute: string;
  objects: Record<string, string>;
  details: Record<string, string>;
  [key: string]: unknown;
}

const SEVERITY_BORDER: Record<string, string> = {
  success: "transparent",
  warning: "var(--mui-palette-warning-light)",
  failure: "var(--mui-palette-surface-errorFg)",
};

const SEVERITY_DOT: Record<string, string> = {
  success: "var(--mui-palette-success-light)",
  warning: "var(--mui-palette-warning-light)",
  failure: "var(--mui-palette-surface-errorFg)",
};

export function SettingsAuditLogComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<AuditLogConfig>(id);
  const { filters, setFilter } = useFilters();
  const { show } = useToast();
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AuditEvent | null>(null);

  const query = useMemo(
    () => ({ ...filters, page, pageSize: config.pageSize }),
    [filters, page, config.pageSize],
  );
  const { data, totalCount } = useFetch<AuditEvent[]>(id, { filters: query });
  // Export pulls the whole filtered set, not just the page on screen.
  const { data: allRows } = useFetch<AuditEvent[]>(id, {
    filters: { ...filters, pageSize: 1000 },
  });

  // The design's User dropdown lists whoever actually appears in the log, so its
  // options come from the data rather than the static configuration.
  const userFilter: FilterConfig = useMemo(() => {
    const names = [...new Set((allRows ?? []).map((row) => row.user))].sort();
    return {
      type: "select",
      key: "user",
      label: { name: t("filters.user") },
      options: names.map((name) => ({ label: name, value: name })),
    };
  }, [allRows, t]);

  const filterOptions: FilterConfig[] = useMemo(
    () =>
      [config.filters[0] as FilterConfig, userFilter, ...config.filters.slice(1)].map((filter) => {
        const label = filter.label ? { name: t(filter.label.name) } : undefined;
        if ("options" in filter && filter.options) {
          return {
            ...filter,
            label,
            options: filter.options.map((o) => ({ ...o, label: t(o.label) })),
          };
        }
        if (filter.type === "search") {
          return {
            ...filter,
            label,
            placeholder: filter.placeholder ? t(filter.placeholder) : undefined,
          };
        }
        return { ...filter, label };
      }),
    [config.filters, userFilter, t],
  );

  const rows = data ?? [];
  const pages = Math.max(1, Math.ceil(totalCount / config.pageSize));

  /** Clicking a subject chip narrows the feed to that subject. */
  const filterBySubject = (value: string) => {
    setFilter("search", value);
    setPage(1);
  };

  const copyJson = async (event: AuditEvent) => {
    await navigator.clipboard.writeText(
      JSON.stringify(
        {
          event: event.event,
          category: event.category,
          severity: event.severity,
          user: event.user,
          ip: event.ip,
          time: event.absolute,
          ...event.details,
        },
        null,
        2,
      ),
    );
    show(t("toast.copied"), t("toast.copiedSub"));
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", alignItems: "baseline", gap: "8px" }}>
          <Typography sx={{ fontSize: 14.5, fontWeight: 700 }}>{t("title")}</Typography>
          <Typography sx={{ fontSize: 11.5, color: "text.disabled" }}>{t("suffix")}</Typography>
        </Box>
        <Export id={id} config={config.export} data={allRows ?? []} filename="audit-log" />
      </Box>

      <Filters
        options={filterOptions}
        responsive
        showClearAll
        moreLabel={t("moreFilters")}
        clearAllLabel={t("clearAll")}
      />

      <SectionCard>
        {rows.length === 0 ? (
          <Box sx={{ textAlign: "center", py: "36px" }}>
            <Typography sx={{ fontSize: 13.5, fontWeight: 600 }}>{t("empty")}</Typography>
            <Typography sx={{ fontSize: 11.5, color: "text.disabled", mt: "4px" }}>
              {t("emptySub")}
            </Typography>
          </Box>
        ) : (
          rows.map((row) => (
            <Box
              key={row.id}
              onClick={() => setSelected(row)}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                p: "13px 6px 13px 12px",
                cursor: "pointer",
                borderLeft: "2px solid",
                borderLeftColor: SEVERITY_BORDER[row.severity] ?? "transparent",
                borderTop: "1px solid",
                borderTopColor: "divider",
                "&:hover": { bgcolor: "var(--mui-palette-surface-hoverSubtle)" },
              }}
            >
              <Box
                sx={{
                  width: 30,
                  height: 30,
                  flex: "none",
                  borderRadius: "9px",
                  display: "grid",
                  placeItems: "center",
                  bgcolor: "var(--mui-palette-surface-hoverSubtle)",
                  color: "text.secondary",
                }}
              >
                <IconRenderer name={config.icons[row.category] ?? "history"} size={16} />
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography sx={{ fontSize: 13 }}>{row.event}</Typography>

                {Object.keys(row.objects).length > 0 ? (
                  <Box sx={{ display: "flex", gap: "6px", flexWrap: "wrap", mt: "6px" }}>
                    {Object.entries(row.objects).map(([key, value]) => (
                      <Chip
                        key={key}
                        variant="soft"
                        size="small"
                        title={t("filterHint")}
                        label={`${key} ${value}`}
                        onClick={(clickEvent) => {
                          clickEvent.stopPropagation();
                          filterBySubject(value);
                        }}
                        sx={{ cursor: "pointer" }}
                      />
                    ))}
                  </Box>
                ) : null}

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    flexWrap: "wrap",
                    mt: "6px",
                  }}
                >
                  <Typography
                    title={new Date(row.absolute).toLocaleString()}
                    sx={{ fontSize: 11, color: "text.disabled" }}
                  >
                    {row.when}
                  </Typography>
                  <Chip variant="soft" size="small" label={t(`categories.${row.category}`)} />
                  <Typography
                    sx={{ fontSize: 11, color: "text.disabled", fontFamily: "monospace" }}
                  >
                    {row.ip}
                  </Typography>
                  {row.severity !== "success" ? (
                    <Box sx={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <Box
                        sx={{
                          width: 6,
                          height: 6,
                          borderRadius: 999,
                          bgcolor: SEVERITY_DOT[row.severity],
                        }}
                      />
                      <Typography sx={{ fontSize: 11, color: SEVERITY_DOT[row.severity] }}>
                        {t(`results.${row.severity}`)}
                      </Typography>
                    </Box>
                  ) : null}
                </Box>
              </Box>

              <IconRenderer name="chevron-right" size={17} sx={{ color: "text.disabled" }} />
            </Box>
          ))
        )}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            pt: "14px",
            mt: "4px",
            borderTop: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box>
            <Typography sx={{ fontSize: 11.5, color: "text.secondary" }}>
              {t("count", {
                shown: rows.length,
                total: totalCount,
                page,
                pages,
              })}
            </Typography>
            <Typography sx={{ fontSize: 10.5, color: "text.disabled", mt: "2px" }}>
              {t("retention")}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: "8px" }}>
            <IconButton
              disabled={page <= 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
            >
              <IconRenderer name="arrow-back" size={16} />
            </IconButton>
            <IconButton
              disabled={page >= pages}
              onClick={() => setPage((value) => Math.min(pages, value + 1))}
            >
              <IconRenderer name="arrow-forward" size={16} />
            </IconButton>
          </Box>
        </Box>
      </SectionCard>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.event ?? ""}
        description={selected ? t(`categories.${selected.category}`) : ""}
      >
        {selected ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {[
              [t("detail.time"), new Date(selected.absolute).toLocaleString()],
              [t("detail.user"), selected.user],
              [t("detail.ip"), selected.ip],
              ...Object.entries(selected.objects),
              ...Object.entries(selected.details),
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
                <Typography sx={{ fontSize: 12, color: "text.disabled" }}>{label}</Typography>
                <Typography sx={{ fontSize: 12.5, fontWeight: 600, textAlign: "right" }}>
                  {value}
                </Typography>
              </Box>
            ))}
            <Box
              sx={{
                fontFamily: "monospace",
                fontSize: 11,
                whiteSpace: "pre-wrap",
                p: "12px",
                mt: "6px",
                borderRadius: "10px",
                bgcolor: "var(--mui-palette-surface-hoverSubtle)",
                maxHeight: 220,
                overflow: "auto",
              }}
            >
              {JSON.stringify(
                {
                  event: selected.event,
                  category: selected.category,
                  severity: selected.severity,
                  user: selected.user,
                  ip: selected.ip,
                  time: selected.absolute,
                  ...selected.details,
                },
                null,
                2,
              )}
            </Box>
            <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end", mt: "8px" }}>
              <Button variant="outlined" onClick={() => copyJson(selected)}>
                {t("detail.copy")}
              </Button>
              <Button variant="contained" onClick={() => setSelected(null)}>
                {t("detail.done")}
              </Button>
            </Box>
          </Box>
        ) : null}
      </Modal>
    </Box>
  );
}
