export interface FilterOption {
  label: string;
  value: string;
  count?: number;
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
}

export interface SegmentedFilter extends BaseFilter {
  type: "segmented";
  options: FilterOption[];
}

export interface DropdownFilter extends BaseFilter {
  type: "dropdown";
  options: FilterOption[];
}

export interface RadioFilter extends BaseFilter {
  type: "radio";
  options: FilterOption[];
}

export interface CheckboxFilter extends BaseFilter {
  type: "checkbox";
  options: FilterOption[];
}

export interface SelectFilter extends BaseFilter {
  type: "select";
  options: FilterOption[];
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
