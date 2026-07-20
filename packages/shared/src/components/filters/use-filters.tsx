"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

export type FilterValue = Record<string, unknown>;

export interface UseFiltersResult {
  filters: FilterValue;
  setFilter: (key: string, value: unknown) => void;
  clearFilter: (key: string) => void;
  clearAllFilters: () => void;
  hasActiveFilters: boolean;
}

function isEmpty(value: unknown): boolean {
  return (
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0) ||
    (typeof value === "object" && value !== null && Object.keys(value).length === 0)
  );
}

export function useFilters(): UseFiltersResult {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [filters, setFiltersState] = useState<FilterValue>({});

  useEffect(() => {
    const raw = searchParams.get("filters");
    if (!raw) {
      setFiltersState((prev) => (Object.keys(prev).length ? {} : prev));
      return;
    }
    try {
      const parsed = JSON.parse(decodeURIComponent(raw)) as FilterValue;
      setFiltersState((prev) => (JSON.stringify(prev) !== JSON.stringify(parsed) ? parsed : prev));
    } catch {}
  }, [searchParams]);

  const updateUrl = useCallback(
    (next: FilterValue) => {
      const params = new URLSearchParams(Array.from(searchParams.entries()));
      const encoded = Object.keys(next).length ? encodeURIComponent(JSON.stringify(next)) : null;
      if (params.get("filters") === encoded) return;
      if (encoded) params.set("filters", encoded);
      else params.delete("filters");
      params.delete("page");
      const query = params.toString();
      router.push(`${window.location.pathname}${query ? `?${query}` : ""}`);
    },
    [router, searchParams],
  );

  const setFilter = useCallback(
    (key: string, value: unknown) => {
      const next = { ...filters };
      if (isEmpty(value)) delete next[key];
      else next[key] = value;
      setFiltersState(next);
      updateUrl(next);
    },
    [filters, updateUrl],
  );

  const clearFilter = useCallback(
    (key: string) => {
      const next = { ...filters };
      delete next[key];
      setFiltersState(next);
      updateUrl(next);
    },
    [filters, updateUrl],
  );

  const clearAllFilters = useCallback(() => {
    setFiltersState({});
    updateUrl({});
  }, [updateUrl]);

  return {
    filters,
    setFilter,
    clearFilter,
    clearAllFilters,
    hasActiveFilters: Object.keys(filters).length > 0,
  };
}
