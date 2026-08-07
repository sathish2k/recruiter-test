"use client";

import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import type { TFunc } from "./table-renderer.types";

export function TableFooterRenderer({
  shown,
  total,
  page,
  totalPages,
  onPageChange,
  t,
  variant,
}: {
  shown: number;
  total: number;
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  t: TFunc;
  /** The full-page list draws a divided footer inset to the card edge. */
  variant?: "panel" | "list";
}) {
  const list = variant === "list";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        flexWrap: "wrap",
        ...(list
          ? { p: "12px 20px", borderTop: "1px dashed", borderColor: "surface.divider" }
          : { pt: "14px", px: "14px" }),
        fontSize: 12.5,
        color: "text.disabled",
      }}
    >
      <Box>
        {t("showing", {
          shown,
          total,
          page,
          pages: totalPages,
          defaultValue: "Showing {{shown}} of {{total}} · page {{page}} of {{pages}}",
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
