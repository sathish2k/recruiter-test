"use client";

import { useState } from "react";

export function usePagination(resetKey?: string) {
  const [page, setPage] = useState(1);
  const [lastKey, setLastKey] = useState(resetKey);

  if (resetKey !== lastKey) {
    setLastKey(resetKey);
    setPage(1);
  }

  return { page, setPage };
}
