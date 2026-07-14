"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import type { SortState } from "./table-renderer.types";

// Sort state for a table, synced to the URL (`?sortKey=…&sortDir=…`) so it
// survives reloads, is shareable, and can be set by a link (e.g. the dashboard
// "See all" → Candidates sorted by created date). A header click cycles the
// column asc → desc → cleared. Server- and client-side tables both read `sort`.
export function useSort() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const key = searchParams.get("sortKey");
  const dir = searchParams.get("sortDir") === "desc" ? "desc" : "asc";
  const sort: SortState = key ? { key, dir } : null;

  const toggleSort = useCallback(
    (columnKey: string) => {
      let next: SortState;
      if (key !== columnKey) next = { key: columnKey, dir: "asc" };
      else if (dir === "asc") next = { key: columnKey, dir: "desc" };
      else next = null;

      const params = new URLSearchParams(Array.from(searchParams.entries()));
      if (next) {
        params.set("sortKey", next.key);
        params.set("sortDir", next.dir);
      } else {
        params.delete("sortKey");
        params.delete("sortDir");
      }
      const query = params.toString();
      router.push(`${window.location.pathname}${query ? `?${query}` : ""}`);
    },
    [key, dir, searchParams, router],
  );

  return { sort, toggleSort };
}
