"use client";

import Checkbox from "@mui/material/Checkbox";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { usePortalRouter } from "@recruit/sdk";
import { type ActionHandler, type ActionItem, ActionsMenu } from "../renderers";
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
  selection,
}: {
  id: string;
  row: Row;
  columns: TableColumnConfig[];
  actions: ActionItem[];
  actionHandler?: ActionHandler;
  cells?: Cells;
  rowRouteId?: string;
  selection?: { checked: boolean; toggle: () => void };
}) {
  const router = usePortalRouter();
  return (
    <TableRow
      onClick={rowRouteId ? () => router.push(rowRouteId, { id: String(row.id ?? "") }) : undefined}
      sx={rowRouteId ? { cursor: "pointer" } : undefined}
    >
      {selection ? (
        <TableCell padding="checkbox" onClick={(event) => event.stopPropagation()}>
          <Checkbox size="small" checked={selection.checked} onChange={selection.toggle} />
        </TableCell>
      ) : null}
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
          <ActionsMenu id={id} actions={actions} data={row} actionHandler={actionHandler} />
        </TableCell>
      ) : null}
    </TableRow>
  );
}
