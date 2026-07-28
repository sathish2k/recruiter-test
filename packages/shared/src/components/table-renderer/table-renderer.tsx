"use client";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { type ReactNode, useState } from "react";
import { type ActionHandler, EmptyStateRenderer, IconRenderer, LinkRenderer } from "../renderers";
import { TableBulkBar } from "./table-bulk-bar";
import { TableFooterRenderer } from "./table-footer";
import { TableHeaderRenderer } from "./table-header";
import type {
  BulkHandler,
  Cells,
  Row,
  TableColumnConfig,
  TableRendererConfig,
} from "./table-renderer.types";
import { TableRowRenderer } from "./table-row";
import { TableTitle } from "./table-title";
import { TableTotalsRenderer } from "./table-totals";
import { usePagination } from "./use-pagination";
import { useSort } from "./use-sort";

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

export function TableRenderer({
  id,
  config: configProp,
  data: dataProp,
  filters,
  actionHandler,
  cells,
  headerExtra,
  headerAction,
  footerData,
  onEmptyAction,
  isLoading: isLoadingProp,
  bulkHandler,
}: {
  id: string;
  config?: TableRendererConfig;
  data?: Row[];
  /** Owner-driven loading, for a table whose rows are fetched by its parent —
   * without it the table would show its empty state during that fetch. */
  isLoading?: boolean;
  /** Bulk action `type` → what to do with the selected rows. */
  bulkHandler?: BulkHandler;
  /** External filter params merged into the server query (server mode). */
  filters?: Record<string, unknown>;
  actionHandler?: ActionHandler;
  /** Handler for a first-run empty-state `action` CTA (e.g. open a modal). */
  onEmptyAction?: (action: string) => void;
  /** One-off cell renderers, keyed by a custom cell's `type` (a `type` not
   * handled by a built-in GenericRenderer type). Each receives the row. */
  cells?: Cells;
  /** Node under the card title (see TableTitle). */
  headerExtra?: ReactNode;
  /** Node in the card title's right-hand slot. */
  headerAction?: ReactNode;
  /** Row the `footer` totals cells render against (default `{}`). */
  footerData?: Row;
}) {
  const { t } = useTranslation(id);
  const configFromId = useConfiguration<TableRendererConfig>(id);
  const config = configProp ?? configFromId;

  // Cell configs are handed to GenericRenderer verbatim (no translation
  // context down there), so resolve their translation-key props here where `t`
  // lives — currently `copiedLabel` on copyable text cells.
  const columns: TableColumnConfig[] = (config?.columns ?? []).map((column) => {
    const value = column.value as { copiedLabel?: string };
    if (value && typeof value === "object" && value.copiedLabel) {
      return {
        ...column,
        value: { ...column.value, copiedLabel: t(value.copiedLabel) },
      } as TableColumnConfig;
    }
    return column;
  });
  const actions = config?.actions ?? [];
  const pageSize = config?.pagination?.pageSize;
  const colSpan = columns.length + (actions.length ? 1 : 0);
  // The engine injects `data={}` when a renderer is used directly as a
  // bootstrap value; only a real array counts as client-provided rows.
  const clientRows = Array.isArray(dataProp) ? dataProp : undefined;
  const server = clientRows === undefined;

  const { sort, toggleSort } = useSort();
  const resetKey = `${JSON.stringify(filters ?? {})}|${sort ? `${sort.key}:${sort.dir}` : ""}`;
  const { page: requestedPage, setPage } = usePagination(resetKey);

  const query = server
    ? {
        ...(filters ?? {}),
        ...(sort ? { sortKey: sort.key, sortDir: sort.dir } : {}),
        ...(pageSize ? { page: requestedPage, pageSize } : {}),
      }
    : undefined;

  const [selected, setSelected] = useState<Set<string>>(() => new Set());

  const {
    data,
    meta,
    isLoading: isFetching,
    error,
  } = useFetch<Row[]>(id, {
    data: clientRows,
    filters: query,
  });
  const isLoading = isLoadingProp || isFetching;
  const fetched = Array.isArray(data) ? data : [];

  const sorted =
    server || !sort
      ? fetched
      : [...fetched].sort(
          (a, b) => compare(delve(a, sort.key), delve(b, sort.key)) * (sort.dir === "asc" ? 1 : -1),
        );
  const totalCount = server ? (meta?.totalCount ?? fetched.length) : sorted.length;
  const totalPages = pageSize ? Math.max(1, Math.ceil(totalCount / pageSize)) : 1;
  const page = Math.min(requestedPage, totalPages);
  const paged = server || !pageSize ? sorted : sorted.slice((page - 1) * pageSize, page * pageSize);

  const hasActiveFilter =
    !!filters &&
    Object.values(filters).some(
      (v) => v != null && v !== "" && !(Array.isArray(v) && v.length === 0),
    );
  const showFirstRun = Boolean(config?.emptyState) && !hasActiveFilter;

  if (error) {
    return (
      <Alert severity="error">{t("loadError", "Something went wrong loading the data.")}</Alert>
    );
  }

  const hasWidths = (config?.columns ?? []).some((column) => column.width !== undefined);

  const selectable = Boolean(config?.selectable);
  const pageKeys = paged.map((row) => String(row.id ?? ""));
  const allSelected = pageKeys.length > 0 && pageKeys.every((key) => selected.has(key));
  const someSelected = pageKeys.some((key) => selected.has(key));
  const toggleAll = () =>
    setSelected((current) => {
      const next = new Set(current);
      if (allSelected) for (const key of pageKeys) next.delete(key);
      else for (const key of pageKeys) next.add(key);
      return next;
    });
  const selectedRows = paged.filter((row) => selected.has(String(row.id ?? "")));

  // Full-bleed list chrome, scoped here so the theme keeps serving panels.
  const listSx =
    config?.variant === "list"
      ? {
          p: 0,
          overflow: "hidden",
          "& .MuiTableCell-paddingCheckbox": {
            paddingLeft: "20px",
            paddingRight: 0,
            width: 46,
          },
          "& .MuiTableCell-paddingCheckbox + .MuiTableCell-root": { paddingLeft: "12px" },
          "& .MuiTableCell-head": {
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".1em",
            textTransform: "uppercase" as const,
            whiteSpace: "nowrap" as const,
            padding: "11px 10px",
            borderRadius: 0,
            "&:first-of-type": { paddingLeft: "20px", borderRadius: 0 },
            "&:last-of-type": { paddingRight: "20px", borderRadius: 0 },
          },
          "& .MuiTableBody-root .MuiTableCell-root": {
            padding: "13px 10px",
            borderTop: "1px solid",
            borderColor: "surface.divider",
            "&:first-of-type": { paddingLeft: "20px" },
            "&:last-of-type": { paddingRight: "20px" },
          },
        }
      : undefined;

  return (
    <TableContainer sx={listSx}>
      {config?.header ? (
        <TableTitle
          config={config.header}
          meta={meta}
          t={t}
          extra={headerExtra}
          action={headerAction}
        />
      ) : null}
      {selectable && selected.size > 0 ? (
        <TableBulkBar
          count={selected.size}
          actions={config?.bulkActions ?? []}
          rows={selectedRows}
          bulkHandler={bulkHandler}
          onClear={() => setSelected(new Set())}
          t={t}
        />
      ) : null}
      {/* Declared column widths only bind under a fixed layout; tables that
          don't set any keep the browser's content-driven sizing. */}
      <Table size="small" sx={hasWidths ? { tableLayout: "fixed" } : undefined}>
        <TableHead>
          <TableHeaderRenderer
            columns={columns}
            hasActions={actions.length > 0}
            actionsLabelKey={config?.actionsLabel?.name ?? ""}
            sort={sort}
            onSort={toggleSort}
            t={t}
            selection={selectable ? { all: allSelected, some: someSelected, toggleAll } : undefined}
          />
        </TableHead>
        <TableBody>
          {isLoading ? (
            Array.from({ length: pageSize ?? 5 }).map((_, r) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows.
              <TableRow key={r}>
                {Array.from({ length: colSpan || 1 }).map((__, c) => (
                  // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton cells.
                  <TableCell key={c}>
                    <Skeleton variant="text" width="70%" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : paged.length === 0 ? (
            <TableRow sx={{ "&:hover": { background: "transparent" } }}>
              <TableCell
                colSpan={colSpan || 1}
                align="center"
                sx={{ py: showFirstRun ? "16px" : "32px", borderBottom: "none" }}
              >
                {showFirstRun && config?.emptyState ? (
                  <EmptyStateRenderer config={config.emptyState} t={t} onAction={onEmptyAction} />
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <Box
                      sx={{
                        width: 54,
                        height: 54,
                        borderRadius: "14px",
                        border: "1.5px dashed var(--mui-palette-surface-borderStrong)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <IconRenderer
                        name="search"
                        size={24}
                        color="var(--mui-palette-text-disabled)"
                      />
                    </Box>
                    <Box
                      sx={{
                        fontSize: 14.5,
                        fontWeight: 700,
                        color: "text.primary",
                        mt: "4px",
                      }}
                    >
                      {t(config?.emptyLabel ?? "noData")}
                    </Box>
                    <Box sx={{ fontSize: 12.5, color: "text.secondary" }}>
                      {t("emptyHint", "Try adjusting or clearing the filters.")}
                    </Box>
                    {config?.emptyActions?.length ? (
                      <Box sx={{ display: "flex", gap: "8px", mt: "6px" }}>
                        {config.emptyActions.map((action) => (
                          <LinkRenderer
                            key={action.type ?? action.routeId}
                            config={{ id, ...action }}
                          >
                            <Button
                              variant={action.type === "add" ? "contained" : "outlined"}
                              startIcon={
                                action.icon ? (
                                  <IconRenderer name={action.icon} size={15} />
                                ) : undefined
                              }
                            >
                              {t(action.label?.name ?? "")}
                            </Button>
                          </LinkRenderer>
                        ))}
                      </Box>
                    ) : null}
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ) : (
            paged.map((row, rowIndex) => (
              <TableRowRenderer
                key={String(row.id ?? rowIndex)}
                id={id}
                row={row}
                columns={columns}
                actions={actions}
                actionHandler={actionHandler}
                cells={cells}
                rowRouteId={config?.rowRouteId}
                selection={
                  selectable
                    ? {
                        checked: selected.has(String(row.id ?? "")),
                        toggle: () =>
                          setSelected((current) => {
                            const next = new Set(current);
                            const key = String(row.id ?? "");
                            if (next.has(key)) next.delete(key);
                            else next.add(key);
                            return next;
                          }),
                      }
                    : undefined
                }
              />
            ))
          )}
          {config?.footer && !isLoading && paged.length > 0 ? (
            <TableTotalsRenderer
              cells={config.footer.cells}
              columns={columns}
              data={footerData ?? {}}
              hasActions={actions.length > 0}
              customCells={cells}
            />
          ) : null}
        </TableBody>
      </Table>
      {pageSize && totalCount > 0 ? (
        <TableFooterRenderer
          variant={config?.variant}
          shown={paged.length}
          total={totalCount}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          t={t}
        />
      ) : null}
    </TableContainer>
  );
}
