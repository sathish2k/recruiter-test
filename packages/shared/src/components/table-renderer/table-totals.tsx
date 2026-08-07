"use client";

import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { GenericRenderer, type GenericRendererConfig } from "../renderers";
import type { CellConfig, Cells, Row, TableColumnConfig } from "./table-renderer.types";

export function TableTotalsRenderer({
  cells,
  columns,
  data,
  hasActions,
  customCells,
}: {
  cells: CellConfig[];
  columns: TableColumnConfig[];
  data: Row;
  hasActions: boolean;
  customCells?: Cells;
}) {
  return (
    <TableRow
      sx={{
        "&:hover": { background: "transparent" },
        "& > td": {
          borderTop: "1px dashed",
          borderColor: "divider",
          color: "text.secondary",
          fontWeight: 700,
        },
      }}
    >
      {cells.map((cell, index) => (
        <TableCell
          // biome-ignore lint/suspicious/noArrayIndexKey: cells are positional, aligned to columns.
          key={index}
          align={columns[index]?.align}
        >
          {customCells?.[cell.type] ? (
            customCells[cell.type](data)
          ) : (
            <GenericRenderer config={cell as GenericRendererConfig} data={data} />
          )}
        </TableCell>
      ))}
      {hasActions ? <TableCell /> : null}
    </TableRow>
  );
}
