"use client";

import { useCallback, useEffect, useState } from "react";
import type { FilterValue } from "./use-filters";

export interface SavedFilter {
  id: string;
  name: string;
  filters: FilterValue;
}

export interface UseSavedFiltersResult {
  saved: SavedFilter[];
  /** Stores the current filter set under a name. Re-using a name overwrites. */
  save: (name: string, filters: FilterValue) => void;
  remove: (id: string) => void;
  /** Id of the saved set the current filters match, if any. */
  activeId: (filters: FilterValue) => string | null;
}

const KEY = (scope: string) => `hpx-saved-filters:${scope}`;

/** Order-independent, so two sets built in a different order still match. */
function fingerprint(filters: FilterValue): string {
  return JSON.stringify(
    Object.keys(filters)
      .filter((key) => filters[key] !== undefined && filters[key] !== "")
      .sort()
      .map((key) => [key, filters[key]]),
  );
}

/**
 * Named filter sets, per screen.
 *
 * Kept in `localStorage` rather than on the server: a saved filter is a
 * personal working habit, not workspace data, and a recruiter should not need a
 * round trip to get their own view back. `scope` is the route id, so "Overdue"
 * on candidates and "Overdue" on requisitions stay separate.
 */
export function useSavedFilters(scope: string): UseSavedFiltersResult {
  const [saved, setSaved] = useState<SavedFilter[]>([]);

  // Read after mount — `localStorage` does not exist during the server render,
  // and seeding from it would desync hydration.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(KEY(scope));
      setSaved(raw ? (JSON.parse(raw) as SavedFilter[]) : []);
    } catch {
      setSaved([]);
    }
  }, [scope]);

  const persist = useCallback(
    (next: SavedFilter[]) => {
      setSaved(next);
      try {
        window.localStorage.setItem(KEY(scope), JSON.stringify(next));
      } catch {}
    },
    [scope],
  );

  const save = useCallback(
    (name: string, filters: FilterValue) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      const next = saved.filter((entry) => entry.name !== trimmed);
      persist([...next, { id: `${scope}:${trimmed}`, name: trimmed, filters }]);
    },
    [saved, persist, scope],
  );

  const remove = useCallback(
    (id: string) => persist(saved.filter((entry) => entry.id !== id)),
    [saved, persist],
  );

  const activeId = useCallback(
    (filters: FilterValue) => {
      const current = fingerprint(filters);
      return saved.find((entry) => fingerprint(entry.filters) === current)?.id ?? null;
    },
    [saved],
  );

  return { saved, save, remove, activeId };
}
