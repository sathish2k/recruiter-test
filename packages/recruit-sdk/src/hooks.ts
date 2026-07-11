"use client";

import { useMemo } from "react";
import useSWR, { type SWRConfiguration } from "swr";
import { useDatasourceFactory } from "./providers/datasource-provider";
import {
  useComponentData,
  useComponentDatasourceId,
} from "./providers/global-dependency-provider";
import type { DatasourceInstance } from "./types";

const EMPTY_DATASOURCE: DatasourceInstance = {};

export interface ResponseMeta {
  totalCount?: number;
  [key: string]: unknown;
}

export interface PaginatedResponse<T> {
  data: T;
  meta?: ResponseMeta;
}

export interface UseFetchResult<T> {
  data: T | undefined;
  totalCount: number;
  /** The response envelope's `meta` (e.g. counts, summary), when present. */
  meta: ResponseMeta | undefined;
  error: unknown;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<unknown>;
  mutation: DatasourceInstance;
}

export interface UseFetchParams<T>
  extends SWRConfiguration<PaginatedResponse<T>> {
  /** Query object passed straight to the datasource's get(filters). */
  filters?: Record<string, unknown>;
  /** When provided, SWR does NOT fetch — this value is used directly. */
  data?: T | PaginatedResponse<T>;
}

export function useFetch<T = unknown>(
  componentId: string,
  params: UseFetchParams<T> = {},
): UseFetchResult<T> {
  const { filters, data: provided, ...swrOptions } = params;
  const factory = useDatasourceFactory(useComponentDatasourceId(componentId));
  const seed = useComponentData<PaginatedResponse<T>>(componentId);

  const datasource = useMemo(() => {
    if (!factory) return undefined;
    const resolved = factory();
    return (
      typeof resolved === "function" ? resolved() : resolved
    ) as DatasourceInstance;
  }, [factory]);

  // Reads always call the datasource's get(); a provided `data` disables
  // fetching (null key).
  const canRead =
    provided === undefined && typeof datasource?.get === "function";
  const key = canRead ? [componentId, "get", filters ?? {}] : null;

  const {
    data: fetched,
    error,
    isLoading,
    isValidating,
    mutate,
  } = useSWR<PaginatedResponse<T>>(
    key,
    async () =>
      (await (datasource as DatasourceInstance).get(
        filters,
      )) as PaginatedResponse<T>,
    {
      fallbackData: seed && Object.keys(seed).length > 0 ? seed : undefined,
      ...swrOptions,
    },
  );

  const body = (provided ?? fetched) as unknown;
  const isEnvelope =
    !!body && typeof body === "object" && "data" in (body as object);
  const value = (isEnvelope ? (body as PaginatedResponse<T>).data : body) as
    | T
    | undefined;

  const meta = (body as PaginatedResponse<T>)?.meta;
  return {
    data: value,
    totalCount: meta?.totalCount ?? 0,
    meta,
    error,
    isLoading,
    isValidating,
    mutate,
    mutation: datasource ?? EMPTY_DATASOURCE,
  };
}
