"use client";

import { useState } from "react";

// Page state for a table. Resets to page 1 whenever `resetKey` changes (e.g. the
// filters or sort changed) via React's "adjust state during render" pattern —
// no extra effect, no extra fetch. Total pages are derived by the caller from
// the fetched `totalCount`, so this hook stays independent of the data.
export function usePagination(resetKey?: string) {
  const [page, setPage] = useState(1);
  const [lastKey, setLastKey] = useState(resetKey);

  if (resetKey !== lastKey) {
    setLastKey(resetKey);
    setPage(1);
  }

  return { page, setPage };
}
