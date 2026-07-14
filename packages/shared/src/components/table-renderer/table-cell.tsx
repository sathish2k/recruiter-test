"use client";

import TableCell from "@mui/material/TableCell";
import { type ActionHandler, GenericRenderer } from "../renderers";
import type { Row, TableColumnConfig } from "./table-renderer.types";

export function TableCellRenderer({
  column,
  row,
  actionHandler,
}: {
  column: TableColumnConfig;
  row: Row;
  actionHandler?: ActionHandler;
}) {
  return (
    <TableCell align={column.align}>
      <GenericRenderer
        config={column.value}
        data={row}
        actionHandler={actionHandler}
      />
    </TableCell>
  );
}
