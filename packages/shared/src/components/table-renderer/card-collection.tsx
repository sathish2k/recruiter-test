"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import type { ReactNode } from "react";
import { EmptyStateRenderer } from "../renderers";
import { TableFooterRenderer } from "./table-footer";
import type { Row, TableRendererConfig } from "./table-renderer.types";
import { usePagination } from "./use-pagination";

/** Card grid over the table's data contract: same `filters`, same server-side
 * `page`/`pageSize` query, same `meta.totalCount`, same footer — only the body
 * differs. Lets a card screen keep the table's toolbar, filters and paging
 * instead of re-deriving them. */
export function CardCollectionRenderer({
  id,
  config: configProp,
  filters,
  renderItem,
  renderSkeleton,
  itemMinWidth = 300,
  gap = "14px",
  onEmptyAction,
}: {
  id: string;
  config?: TableRendererConfig;
  filters?: Record<string, unknown>;
  renderItem: (row: Row) => ReactNode;
  /** Placeholder card, repeated `pageSize` times while loading. */
  renderSkeleton?: () => ReactNode;
  itemMinWidth?: number;
  gap?: string;
  onEmptyAction?: (action: string) => void;
}) {
  const { t } = useTranslation(id);
  const configFromId = useConfiguration<TableRendererConfig>(id);
  const config = configProp ?? configFromId;
  const pageSize = config?.pagination?.pageSize;

  const resetKey = JSON.stringify(filters ?? {});
  const { page: requestedPage, setPage } = usePagination(resetKey);

  const { data, meta, isLoading, error } = useFetch<Row[]>(id, {
    filters: {
      ...(filters ?? {}),
      ...(pageSize ? { page: requestedPage, pageSize } : {}),
    },
  });
  const rows = Array.isArray(data) ? data : [];
  const totalCount = meta?.totalCount ?? rows.length;
  const totalPages = pageSize ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1;
  const page = Math.min(requestedPage, totalPages);

  const hasActiveFilter =
    !!filters &&
    Object.values(filters).some(
      (value) => value != null && value !== "" && !(Array.isArray(value) && value.length === 0),
    );

  if (error) {
    return (
      <Alert severity="error">{t("loadError", "Something went wrong loading the data.")}</Alert>
    );
  }

  const grid = (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: `repeat(auto-fill,minmax(${itemMinWidth}px,1fr))`,
        gap,
      }}
    >
      {isLoading && renderSkeleton
        ? Array.from({ length: pageSize ?? 6 }, (_, index) => (
            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length skeleton grid
            <Box key={index}>{renderSkeleton()}</Box>
          ))
        : rows.map(renderItem)}
    </Box>
  );

  if (!isLoading && rows.length === 0) {
    return config?.emptyState && !hasActiveFilter ? (
      <EmptyStateRenderer config={config.emptyState} t={t} onAction={onEmptyAction} />
    ) : (
      <Typography sx={{ fontSize: 13, color: "text.secondary", textAlign: "center", py: "40px" }}>
        {t(config?.emptyLabel ?? "noData", "No results.")}
      </Typography>
    );
  }

  return (
    <Box>
      {grid}
      {pageSize && totalPages > 1 ? (
        <TableFooterRenderer
          shown={rows.length}
          total={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          t={t}
        />
      ) : null}
    </Box>
  );
}
