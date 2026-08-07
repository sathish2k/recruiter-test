"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useConfiguration, useFetch, usePortalRouter, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import type { ReactNode } from "react";
import { Export } from "../export";
import { type FilterConfig, Filters, useFilters } from "../filters";
import { type ActionHandler, IconRenderer } from "../renderers";
import { CardCollectionRenderer } from "./card-collection";
import { TableRenderer } from "./table-renderer";
import type { BulkHandler, Cells, TableCta, TableFilterExportConfig } from "./table-renderer.types";

type Row = Record<string, unknown>;

export function TableFilterExportRenderer({
  id,
  config: configProp,
  onCta,
  actionHandler,
  cells,
  headerExtra,
  headerAction,
  renderItem,
  renderSkeleton,
  bulkHandler,
  itemMinWidth,
}: {
  id: string;
  config?: TableFilterExportConfig;
  onCta?: (action: string) => void;
  actionHandler?: ActionHandler;
  /** One-off cell renderers, forwarded to the table (see Cells). */
  cells?: Cells;
  headerExtra?: ReactNode;
  headerAction?: ReactNode;
  /** Render the body as a card grid instead of a table. The toolbar, filters
   * and pagination stay identical — only the item rendering changes. */
  renderItem?: (row: Row) => ReactNode;
  renderSkeleton?: () => ReactNode;
  itemMinWidth?: number;
  /** Bulk action `type` → what to do with the selected rows. */
  bulkHandler?: BulkHandler;
}) {
  const { t } = useTranslation(id);
  const configFromId = useConfiguration<TableFilterExportConfig>(id);
  const config = configProp ?? configFromId;
  const router = usePortalRouter();
  const { filters } = useFilters();

  const { data, meta } = useFetch<Row[]>(id, { filters });
  const exportRows = data ?? [];

  const filterOptions: FilterConfig[] = (config?.filters ?? []).map((f) => {
    const label = f.label ? { name: t(f.label.name) } : undefined;
    if ("options" in f && f.options) {
      // Tab counts come from the response envelope, so they count the whole
      // workspace rather than the page currently on screen.
      const counts =
        f.type === "segmented" && f.countsPath
          ? (delve(meta ?? {}, f.countsPath) as Record<string, number> | undefined)
          : undefined;
      return {
        ...f,
        label,
        options: f.options.map((o) => ({
          ...o,
          label: t(o.label),
          count: counts?.[o.value] ?? o.count,
        })),
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
    <Box sx={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "flex-end",
          gap: "8px",
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
            <Button
              key={cta.label.name}
              variant={primary ? "contained" : "outlined"}
              onClick={() => handleCta(cta)}
              startIcon={
                cta.icon ? (
                  <IconRenderer name={cta.icon} size={cta.icon === "add" ? 18 : 16} />
                ) : undefined
              }
            >
              {t(cta.label.name)}
            </Button>
          );
        })}
      </Box>
      {config?.filters ? (
        <Filters
          options={filterOptions}
          responsive
          showClearAll
          moreLabel={t("moreFilters", "Filters")}
          clearAllLabel={t("clearAll", "Clear all")}
        />
      ) : null}

      {renderItem ? (
        <CardCollectionRenderer
          id={id}
          config={config}
          filters={filters}
          renderItem={renderItem}
          renderSkeleton={renderSkeleton}
          itemMinWidth={itemMinWidth}
          onEmptyAction={onCta}
        />
      ) : (
        <TableRenderer
          id={id}
          config={config}
          filters={filters}
          actionHandler={actionHandler}
          cells={cells}
          headerExtra={headerExtra}
          headerAction={headerAction}
          onEmptyAction={onCta}
          bulkHandler={bulkHandler}
        />
      )}
    </Box>
  );
}
