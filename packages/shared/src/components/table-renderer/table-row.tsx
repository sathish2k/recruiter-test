"use client";

import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { usePortalRouter } from "@recruit/sdk";
import { type ActionHandler, ActionsMenu, type ActionItem } from "../renderers";
import { TableCellRenderer } from "./table-cell";
import type { Row, TableColumnConfig } from "./table-renderer.types";

// One body row: a cell per column, plus a trailing actions column rendered as a
// kebab (⋮) menu when the table declares actions. Each menu item supports a link
// (routeId/href) or a custom action via actionHandler. When `rowRouteId` is set
// the whole row navigates on click.
export function TableRowRenderer({
  id,
  row,
  columns,
  actions,
  actionHandler,
  rowRouteId,
}: {
  id: string;
  row: Row;
  columns: TableColumnConfig[];
  actions: ActionItem[];
  actionHandler?: ActionHandler;
  rowRouteId?: string;
}) {
  const router = usePortalRouter();
  return (
    <TableRow
      onClick={rowRouteId ? () => router.push(rowRouteId) : undefined}
      sx={rowRouteId ? { cursor: "pointer" } : undefined}
    >
      {columns.map((column) => (
        <TableCellRenderer
          key={column.label.name}
          column={column}
          row={row}
          actionHandler={actionHandler}
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
