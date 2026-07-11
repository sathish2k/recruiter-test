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

export interface PaginatedResponse<T> {
  data: T;
  meta?: { totalCount?: number };
}

export interface UseFetchResult<T> {
  data: T | undefined;
  totalCount: number;
  error: unknown;
  isLoading: boolean;
  isValidating: boolean;
  mutate: () => Promise<unknown>;
  mutation: DatasourceInstance;
}

export interface UseFetchOptions<T> extends SWRConfiguration<T> {
  method?: string;
}

export function useFetch<T = unknown>(
  componentId: string,
  // biome-ignore lint/suspicious/noExplicitAny: datasource method args are arbitrary.
  args: any[] = [],
  options: UseFetchOptions<PaginatedResponse<T>> = {},
): UseFetchResult<T> {
  const { method = "get", ...swrOptions } = options;
  const factory = useDatasourceFactory(useComponentDatasourceId(componentId));
  const seed = useComponentData<PaginatedResponse<T>>(componentId);

  const datasource = useMemo(() => {
    if (!factory) return undefined;
    const resolved = factory();
    return (
      typeof resolved === "function" ? resolved() : resolved
    ) as DatasourceInstance;
  }, [factory]);

  const canRead = typeof datasource?.[method] === "function";
  const key = canRead ? [componentId, method, ...args] : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    PaginatedResponse<T>
  >(
    key,
    async () =>
      (await (datasource as DatasourceInstance)[method](
        ...args,
      )) as PaginatedResponse<T>,
    {
      fallbackData: seed && Object.keys(seed).length > 0 ? seed : undefined,
      ...swrOptions,
    },
  );

  const body = data as unknown;
  const isEnvelope =
    !!body && typeof body === "object" && "data" in (body as object);
  const value = (isEnvelope ? (body as PaginatedResponse<T>).data : body) as
    | T
    | undefined;

  return {
    data: value,
    totalCount: (body as PaginatedResponse<T>)?.meta?.totalCount ?? 0,
    error,
    isLoading,
    isValidating,
    mutate,
    mutation: datasource ?? EMPTY_DATASOURCE,
  };
}
