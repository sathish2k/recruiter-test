"use client";

import ChevronLeftRounded from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRounded from "@mui/icons-material/ChevronRightRounded";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { type ReactNode, useMemo, useState } from "react";
import { GenericRenderer, LinkRenderer } from "../renderers";
import type { TableRendererConfig } from "./table-renderer.types";

type Row = Record<string, unknown>;
type SortState = { key: string; dir: "asc" | "desc" };

const HEAD_CELL_SX = {
  fontSize: 12,
  fontWeight: 400,
  color: "#9A968E",
  border: "none",
  background: "rgba(255,255,255,.04)",
  p: "10px 14px",
  "&:first-of-type": {
    borderTopLeftRadius: "10px",
    borderBottomLeftRadius: "10px",
  },
  "&:last-of-type": {
    borderTopRightRadius: "10px",
    borderBottomRightRadius: "10px",
  },
};
const BODY_CELL_SX = {
  fontSize: 13,
  color: "#ECEAE7",
  borderBottom: "1px solid rgba(255,255,255,.05)",
  p: "13px 14px",
};
const PAGE_BTN_SX = {
  width: 30,
  height: 30,
  borderRadius: "999px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 12.5,
  fontWeight: 600,
  cursor: "pointer",
  "&:hover": { background: "rgba(255,255,255,.06)" },
};

function compare(a: unknown, b: unknown): number {
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""));
}

// A config-driven table. `id` resolves its configuration (columns/actions),
// data (via useFetch) and translations. Each cell renders through
// GenericRenderer; column labels + actions resolve translation keys by id.
export function TableRenderer({
  id,
  config: configProp,
  data: dataProp,
}: {
  id: string;
  config?: TableRendererConfig;
  data?: Row[];
}) {
  const { t } = useTranslation(id);
  const configFromId = useConfiguration<TableRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { data, isLoading, error } = useFetch<Row[]>(id, { data: dataProp });

  const [sort, setSort] = useState<SortState | null>(null);
  const [pageState, setPage] = useState(1);

  const columns = config?.columns ?? [];
  const actions = config?.actions ?? [];
  const pageSize = config?.pagination?.pageSize;
  const colSpan = columns.length + (actions.length ? 1 : 0);

  const rows = useMemo<Row[]>(() => {
    const list = Array.isArray(data) ? data : [];
    if (!sort) return list;
    const dir = sort.dir === "asc" ? 1 : -1;
    return [...list].sort(
      (a, b) => compare(delve(a, sort.key), delve(b, sort.key)) * dir,
    );
  }, [data, sort]);

  const totalPages = pageSize
    ? Math.max(1, Math.ceil(rows.length / pageSize))
    : 1;
  const page = Math.min(pageState, totalPages);
  const paged = useMemo(() => {
    if (!pageSize) return rows;
    return rows.slice((page - 1) * pageSize, page * pageSize);
  }, [rows, pageSize, page]);

  const toggleSort = (key: string) => {
    setSort((prev) =>
      prev?.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" },
    );
    setPage(1);
  };

  const headRow = (
    <TableRow>
      {columns.map((column) => (
        <TableCell
          key={column.label.name}
          align={column.align}
          sx={{ ...HEAD_CELL_SX, width: column.width }}
        >
          {column.sort ? (
            <TableSortLabel
              active={sort?.key === column.sort.key}
              direction={sort?.key === column.sort.key ? sort.dir : "asc"}
              onClick={() => column.sort && toggleSort(column.sort.key)}
            >
              {t(column.label.name)}
            </TableSortLabel>
          ) : (
            t(column.label.name)
          )}
        </TableCell>
      ))}
      {actions.length ? (
        <TableCell align="right" sx={HEAD_CELL_SX}>
          {t(config?.actionsLabel?.name ?? "actions")}
        </TableCell>
      ) : null}
    </TableRow>
  );

  let body: ReactNode;
  if (isLoading) {
    body = Array.from({ length: pageSize ?? 5 }).map((_, r) => (
      // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton rows.
      <TableRow key={r}>
        {Array.from({ length: colSpan || 1 }).map((__, c) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton cells.
          <TableCell key={c} sx={BODY_CELL_SX}>
            <Skeleton variant="text" width="70%" />
          </TableCell>
        ))}
      </TableRow>
    ));
  } else if (rows.length === 0) {
    body = (
      <TableRow>
        <TableCell
          colSpan={colSpan || 1}
          align="center"
          sx={{ ...BODY_CELL_SX, color: "#7C7972", py: "32px" }}
        >
          {t(config?.emptyLabel ?? "noData")}
        </TableCell>
      </TableRow>
    );
  } else {
    body = paged.map((row, rowIndex) => (
      <TableRow
        key={String(row.id ?? rowIndex)}
        sx={{ "&:hover": { background: "rgba(255,255,255,.03)" } }}
      >
        {columns.map((column) => (
          <TableCell
            key={column.label.name}
            align={column.align}
            sx={BODY_CELL_SX}
          >
            <GenericRenderer config={column.value} data={row} />
          </TableCell>
        ))}
        {actions.length ? (
          <TableCell align="right" sx={BODY_CELL_SX}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "14px",
              }}
            >
              {actions.map((action, i) => (
                <LinkRenderer
                  key={action.routeId ?? action.href ?? i}
                  config={{ ...action, id }}
                  data={row}
                />
              ))}
            </Box>
          </TableCell>
        ) : null}
      </TableRow>
    ));
  }

  if (error) {
    return (
      <Alert severity="error">
        {t("loadError", "Something went wrong loading the data.")}
      </Alert>
    );
  }

  return (
    <Box
      sx={{
        background: "#1C1C1B",
        border: "1px solid rgba(255,255,255,.06)",
        borderRadius: "16px",
        p: "18px 20px",
      }}
    >
      <TableContainer>
        <Table size="small">
          <TableHead>{headRow}</TableHead>
          <TableBody>{body}</TableBody>
        </Table>
      </TableContainer>
      {pageSize && rows.length > 0 ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: "14px 14px 4px",
            fontSize: 12.5,
            color: "#7C7972",
          }}
        >
          <Box>
            {t("showing", "Showing {shown} of {total} · page {page} of {pages}")
              .replace("{shown}", String(paged.length))
              .replace("{total}", String(rows.length))
              .replace("{page}", String(page))
              .replace("{pages}", String(totalPages))}
          </Box>
          <Box sx={{ display: "flex", gap: "6px" }}>
            <Box
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              sx={{
                ...PAGE_BTN_SX,
                border: "1px solid rgba(255,255,255,.12)",
                color: page > 1 ? "#ECEAE7" : "#5E5B55",
              }}
            >
              <ChevronLeftRounded sx={{ fontSize: 15 }} />
            </Box>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Box
                key={n}
                onClick={() => setPage(n)}
                sx={{
                  ...PAGE_BTN_SX,
                  background:
                    page === n ? "rgba(255,255,255,.08)" : "transparent",
                  border: `1px solid ${
                    page === n ? "transparent" : "rgba(255,255,255,.06)"
                  }`,
                  color: page === n ? "#ECEAE7" : "#9A968E",
                }}
              >
                {n}
              </Box>
            ))}
            <Box
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              sx={{
                ...PAGE_BTN_SX,
                border: "1px solid rgba(255,255,255,.12)",
                color: page < totalPages ? "#ECEAE7" : "#5E5B55",
              }}
            >
              <ChevronRightRounded sx={{ fontSize: 15 }} />
            </Box>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
