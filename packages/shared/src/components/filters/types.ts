import type { OptionSource } from "../forms/types";

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

/** Option-bearing filters can either ship a static `options` list or pull one
 * from an API endpoint via `optionSource` (same shape the form selects use). */
export interface RemoteOptions {
  optionSource?: OptionSource;
}

interface BaseFilter {
  /** State key (also the URL param key via useFilters). */
  key: string;
  /** Label (name is a translation key resolved by the caller, or a literal). */
  label?: { name: string };
}

export interface SearchFilter extends BaseFilter {
  type: "search";
  placeholder?: string;
  width?: number;
}

export interface SegmentedFilter extends BaseFilter {
  type: "segmented";
  options: FilterOption[];
}

export interface DropdownFilter extends BaseFilter, RemoteOptions {
  type: "dropdown";
  options?: FilterOption[];
}

export interface RadioFilter extends BaseFilter, RemoteOptions {
  type: "radio";
  options?: FilterOption[];
}

export interface CheckboxFilter extends BaseFilter, RemoteOptions {
  type: "checkbox";
  options?: FilterOption[];
}

export interface SelectFilter extends BaseFilter, RemoteOptions {
  type: "select";
  options?: FilterOption[];
}

export interface ToggleFilter extends BaseFilter {
  type: "toggle";
}

export interface DateFilter extends BaseFilter {
  type: "date";
}

export interface DateRangeFilter extends BaseFilter {
  type: "daterange";
}

export interface RangeFilter extends BaseFilter {
  type: "range";
  min: number;
  max: number;
}

export type FilterConfig =
  | SearchFilter
  | SegmentedFilter
  | DropdownFilter
  | RadioFilter
  | CheckboxFilter
  | SelectFilter
  | ToggleFilter
  | DateFilter
  | DateRangeFilter
  | RangeFilter;

export interface FiltersConfig {
  options: FilterConfig[];
}
