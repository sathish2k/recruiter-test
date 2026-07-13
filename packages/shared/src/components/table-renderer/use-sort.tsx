"use client";

import { useState } from "react";
import type { SortState } from "./table-renderer.types";

// Sort state for a table. A header click cycles the column
// asc → desc → cleared (matches the design). Server- and client-side tables
// both read `sort`; the table decides whether to sort locally or in the query.
export function useSort() {
  const [sort, setSort] = useState<SortState>(null);

  const toggleSort = (key: string) =>
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });

  return { sort, toggleSort };
}
