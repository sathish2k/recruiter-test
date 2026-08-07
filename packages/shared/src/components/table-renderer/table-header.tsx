"use client";

import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import type { SortState, TableColumnConfig, TFunc } from "./table-renderer.types";

export function TableHeaderRenderer({
  columns,
  hasActions,
  actionsLabelKey,
  sort,
  onSort,
  t,
  selection,
}: {
  columns: TableColumnConfig[];
  hasActions: boolean;
  actionsLabelKey: string;
  sort: SortState;
  onSort: (key: string) => void;
  t: TFunc;
  /** Present when the table is selectable — drives the select-page checkbox. */
  selection?: { all: boolean; some: boolean; toggleAll: () => void };
}) {
  return (
    <TableRow>
      {selection ? (
        <TableCell padding="checkbox" sx={{ width: 44 }}>
          <Checkbox
            size="small"
            checked={selection.all}
            indeterminate={selection.some && !selection.all}
            onChange={selection.toggleAll}
          />
        </TableCell>
      ) : null}
      {columns.map((column) => (
        <TableCell key={column.label.name} align={column.align} sx={{ width: column.width }}>
          {column.sort ? (
            <TableSortLabel
              active={sort?.key === column.sort.key}
              direction={sort?.key === column.sort.key ? sort.dir : "asc"}
              onClick={() => column.sort && onSort(column.sort.key)}
            >
              {t(column.label.name)}
            </TableSortLabel>
          ) : (
            t(column.label.name)
          )}
        </TableCell>
      ))}
      {/* Omitting `actionsLabel` leaves the trailing header blank, as the
          designs do — the kebab column needs no caption. */}
      {hasActions ? (
        <TableCell align="right">{actionsLabelKey ? t(actionsLabelKey) : null}</TableCell>
      ) : null}
    </TableRow>
  );
}
