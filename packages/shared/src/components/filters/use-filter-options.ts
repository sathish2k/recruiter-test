"use client";

import { useRemoteOptions } from "../forms/select/remote-options";
import type { OptionSource } from "../forms/types";
import type { FilterOption } from "./types";

/**
 * Resolves a filter's option list. When `optionSource` is set the options are
 * fetched from the API (shared cache with the form selects, so the same
 * endpoint is hit once); otherwise the static `options` are returned as-is.
 */
export function useFilterOptions(config: {
  options?: FilterOption[];
  optionSource?: OptionSource;
}): FilterOption[] {
  const { options } = useRemoteOptions(config.optionSource, "");
  if (!config.optionSource) return config.options ?? [];
  return options.map((option) => ({ value: option.value, label: option.label }));
}
