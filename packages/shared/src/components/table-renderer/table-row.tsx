"use client";

import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import {
  type ActionHandler,
  LinkRenderer,
  type LinkRendererConfig,
} from "../renderers";
import { TableCellRenderer } from "./table-cell";
import type { Row, TableColumnConfig } from "./table-renderer.types";

// One body row: a cell per column, plus the trailing actions column (config-
// driven links resolved per row) when the table declares actions.
export function TableRowRenderer({
  id,
  row,
  columns,
  actions,
  actionHandler,
}: {
  id: string;
  row: Row;
  columns: TableColumnConfig[];
  actions: LinkRendererConfig[];
  actionHandler?: ActionHandler;
}) {
  return (
    <TableRow>
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
          <Box
            sx={{ display: "flex", justifyContent: "flex-end", gap: "14px" }}
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
  );
}
