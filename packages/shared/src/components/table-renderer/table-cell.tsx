"use client";

import TableCell from "@mui/material/TableCell";
import { type ActionHandler, GenericRenderer } from "../renderers";
import type { Row, TableColumnConfig } from "./table-renderer.types";

// One body cell. The cell's content is fully config-driven: GenericRenderer
// dispatches on `column.value.type` (string/entity/pill/ai-match/actions/…).
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
