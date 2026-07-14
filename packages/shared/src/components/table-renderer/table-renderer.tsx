"use client";

import Alert from "@mui/material/Alert";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import type { ActionHandler } from "../renderers";
import { TableFooterRenderer } from "./table-footer";
import { TableHeaderRenderer } from "./table-header";
import type { Row, TableRendererConfig } from "./table-renderer.types";
import { TableRowRenderer } from "./table-row";
import { TableTitle } from "./table-title";
import { usePagination } from "./use-pagination";
import { useSort } from "./use-sort";

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

// A config-driven table. `id` resolves its configuration, translations and data.
// Sort + pagination live in the useSort / usePagination hooks and drive the
// fetch server-side: the `filters` prop is merged with sort/page into the query
// and `meta.totalCount` gives the page count. Injecting `data` instead switches
// to client-side sort/pagination (standalone use). The header/row/footer are
// split into their own renderers; all chrome comes from the theme.
export function TableRenderer({
  id,
  config: configProp,
  data: dataProp,
  filters,
  actionHandler,
}: {
  id: string;
  config?: TableRendererConfig;
  data?: Row[];
  /** External filter params merged into the server query (server mode). */
  filters?: Record<string, unknown>;
  actionHandler?: ActionHandler;
}) {
  const { t } = useTranslation(id);
  const configFromId = useConfiguration<TableRendererConfig>(id);
  const config = configProp ?? configFromId;

  const columns = config?.columns ?? [];
  const actions = config?.actions ?? [];
  const pageSize = config?.pagination?.pageSize;
  const colSpan = columns.length + (actions.length ? 1 : 0);
  const server = dataProp === undefined;

  const { sort, toggleSort } = useSort();
  // Reset the page whenever the filters or the sort change.
  const resetKey = `${JSON.stringify(filters ?? {})}|${
    sort ? `${sort.key}:${sort.dir}` : ""
  }`;
  const { page: requestedPage, setPage } = usePagination(resetKey);

  const query = server
    ? {
        ...(filters ?? {}),
        ...(sort ? { sortKey: sort.key, sortDir: sort.dir } : {}),
        ...(pageSize ? { page: requestedPage, pageSize } : {}),
      }
    : undefined;

  const { data, meta, isLoading, error } = useFetch<Row[]>(id, {
    data: dataProp,
    filters: query,
  });
  const fetched = Array.isArray(data) ? data : [];

  // Server mode: rows arrive already sorted + paged. Client mode: do it here.
  const sorted =
    server || !sort
      ? fetched
      : [...fetched].sort(
          (a, b) =>
            compare(delve(a, sort.key), delve(b, sort.key)) *
            (sort.dir === "asc" ? 1 : -1),
        );
  const totalCount = server
    ? (meta?.totalCount ?? fetched.length)
    : sorted.length;
  const totalPages = pageSize
    ? Math.max(1, Math.ceil(totalCount / pageSize))
    : 1;
  const page = Math.min(requestedPage, totalPages);
  const paged =
    server || !pageSize
      ? sorted
      : sorted.slice((page - 1) * pageSize, page * pageSize);

  if (error) {
    return (
      <Alert severity="error">
        {t("loadError", "Something went wrong loading the data.")}
      </Alert>
    );
  }

  return (
    <TableContainer>
      {config?.header ? (
        <TableTitle config={config.header} meta={meta} t={t} />
      ) : null}
      <Table size="small">
        <TableHead>
          <TableHeaderRenderer
            columns={columns}
            hasActions={actions.length > 0}
            actionsLabelKey={config?.actionsLabel?.name ?? "actions"}
            sort={sort}
            onSort={toggleSort}
            t={t}
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
                sx={{ color: "#7C7972", py: "32px", borderBottom: "none" }}
              >
                {t(config?.emptyLabel ?? "noData")}
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
                rowRouteId={config?.rowRouteId}
              />
            ))
          )}
        </TableBody>
      </Table>
      {pageSize && totalCount > 0 ? (
        <TableFooterRenderer
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
