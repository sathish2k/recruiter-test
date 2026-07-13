"use client";

import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import type { TFunc } from "./table-renderer.types";

// The table's footer: a "Showing … of …" summary (i18next-interpolated) and the
// MUI pagination control. Purely presentational — page state lives in the table.
export function TableFooterRenderer({
  shown,
  total,
  page,
  totalPages,
  onPageChange,
  t,
}: {
  shown: number;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  t: TFunc;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        pt: "14px",
        fontSize: 12.5,
        color: "#7C7972",
      }}
    >
      <Box>
        {t("showing", {
          shown,
          total,
          page,
          pages: totalPages,
          defaultValue:
            "Showing {{shown}} of {{total}} · page {{page}} of {{pages}}",
        })}
      </Box>
      <Pagination
        count={totalPages}
        page={page}
        onChange={(_, next) => onPageChange(next)}
        shape="circular"
      />
    </Box>
  );
}
