"use client";

import TableCell from "@mui/material/TableCell";
import { type ActionHandler, GenericRenderer, type GenericRendererConfig } from "../renderers";
import type { Cells, Row, TableColumnConfig } from "./table-renderer.types";

export function TableCellRenderer({
  column,
  row,
  actionHandler,
  cells,
}: {
  column: TableColumnConfig;
  row: Row;
  actionHandler?: ActionHandler;
  cells?: Cells;
}) {
  const custom = cells?.[column.value.type];
  return (
    <TableCell align={column.align}>
      {custom ? (
        custom(row)
      ) : (
        <GenericRenderer
          config={column.value as GenericRendererConfig}
          data={row}
          actionHandler={actionHandler}
        />
      )}
    </TableCell>
  );
}
