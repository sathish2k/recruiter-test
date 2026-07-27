"use client";

import { httpClient } from "@recruit/sdk";
import delve from "dlv";
import { useEffect, useRef, useState } from "react";
import type { OptionSource, SelectOption } from "../types";

/**
 * Shared cache for option lists. Keyed by url+params, so three fields sourcing
 * their options from the same endpoint (timezone, currency, language all read
 * `/reference`) trigger exactly one request. Stores the in-flight promise, not
 * just the result, so concurrent mounts dedupe too.
 */
const cache = new Map<string, Promise<unknown>>();

/** Keyed by the *request*, not the extraction path — four fields reading
 * different slices of `/reference` must still share one round trip. */
function cacheKey(source: OptionSource, search?: string): string {
  return JSON.stringify([source.url, source.params ?? {}, search ?? ""]);
}

function toOptions(body: unknown, source: OptionSource): SelectOption[] {
  const raw = source.path ? delve(body as Record<string, unknown>, source.path) : body;
  if (!Array.isArray(raw)) return [];
  const valueKey = source.valueKey ?? "value";
  const labelKey = source.labelKey ?? "label";
  return raw.map((row) => {
    if (typeof row === "string") return { value: row, label: row };
    const record = row as Record<string, unknown>;
    return {
      value: String(record[valueKey] ?? ""),
      label: String(record[labelKey] ?? record[valueKey] ?? ""),
      // Kept so a caller can search on a second field (e.g. a language's
      // English name) or render richer rows.
      raw: record,
    };
  });
}

export function fetchOptions(source: OptionSource, search?: string): Promise<SelectOption[]> {
  const key = cacheKey(source, search);
  let request = cache.get(key);

  if (!request) {
    const params: Record<string, string> = { ...(source.params ?? {}) };
    if (source.searchParam && search) params[source.searchParam] = search;
    request = httpClient
      .get(source.url, { params })
      .then((response) => response.data as unknown)
      .catch((error) => {
        // Don't poison the cache — a retry should be able to succeed.
        cache.delete(key);
        throw error;
      });
    cache.set(key, request);
  }

  // The body is shared; each field slices its own path out of it.
  return request.then((body) => toOptions(body, source));
}

/** Bumped on every invalidation so mounted fields refetch, not just later mounts. */
let epoch = 0;
const listeners = new Set<() => void>();

/** Drops cached lists so a mutation elsewhere can force a refetch. */
export function invalidateOptions(url?: string) {
  if (!url) cache.clear();
  else {
    for (const key of [...cache.keys()]) {
      if (key.includes(JSON.stringify(url))) cache.delete(key);
    }
  }
  epoch += 1;
  for (const listener of listeners) listener();
}

export interface UseRemoteOptionsResult {
  options: SelectOption[];
  loading: boolean;
  error: unknown;
}

/**
 * Loads a field's options. Static `enum`s short-circuit; a `searchParam` on the
 * source switches to server-side search (debounced), otherwise the list is
 * fetched once and filtered in the component.
 */
export function useRemoteOptions(
  source: OptionSource | undefined,
  search: string,
): UseRemoteOptionsResult {
  const [options, setOptions] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const [version, setVersion] = useState(epoch);
  const latest = useRef(0);

  // A create elsewhere (the quick-contact modal) invalidates the list; without
  // this the already-mounted field would keep showing the stale options.
  useEffect(() => {
    const listener = () => setVersion(epoch);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  // Server-side search re-queries per term; otherwise the term never hits the
  // network, so the effect shouldn't depend on it.
  const query = source?.searchParam ? search : "";

  // `source` comes from the field's configuration, so its identity is stable
  // across renders; fetchOptions dedupes anything that slips through.
  useEffect(() => {
    const current = source;
    if (!current) {
      setOptions([]);
      return;
    }
    const ticket = ++latest.current;
    setLoading(true);
    const timer = setTimeout(
      () => {
        fetchOptions(current, query)
          .then((result) => {
            if (latest.current !== ticket) return; // a newer query won
            setOptions(result);
            setError(null);
          })
          .catch((cause) => {
            if (latest.current !== ticket) return;
            setError(cause);
            setOptions([]);
          })
          .finally(() => {
            if (latest.current === ticket) setLoading(false);
          });
      },
      // Only debounce when typing actually causes a request.
      current.searchParam && query ? (current.debounceMs ?? 250) : 0,
    );
    return () => clearTimeout(timer);
  }, [source, query, version]);

  return { options, loading, error };
}
