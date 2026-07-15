"use client";

import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { usePortalRouter } from "@recruit/sdk";
import { type ActionHandler, ActionsMenu, type ActionItem } from "../renderers";
import { TableCellRenderer } from "./table-cell";
import type { Cells, Row, TableColumnConfig } from "./table-renderer.types";

export function TableRowRenderer({
  id,
  row,
  columns,
  actions,
  actionHandler,
  cells,
  rowRouteId,
}: {
  id: string;
  row: Row;
  columns: TableColumnConfig[];
  actions: ActionItem[];
  actionHandler?: ActionHandler;
  cells?: Cells;
  rowRouteId?: string;
}) {
  const router = usePortalRouter();
  return (
    <TableRow
      onClick={
        rowRouteId
          ? () => router.push(rowRouteId, { id: String(row.id ?? "") })
          : undefined
      }
      sx={rowRouteId ? { cursor: "pointer" } : undefined}
    >
      {columns.map((column) => (
        <TableCellRenderer
          key={column.label.name}
          column={column}
          row={row}
          actionHandler={actionHandler}
          cells={cells}
        />
      ))}
      {actions.length ? (
        <TableCell align="right">
          <ActionsMenu
            id={id}
            actions={actions}
            data={row}
            actionHandler={actionHandler}
          />
        </TableCell>
      ) : null}
    </TableRow>
  );
}
