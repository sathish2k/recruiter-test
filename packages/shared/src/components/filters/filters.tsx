"use client";

import CloseRounded from "@mui/icons-material/CloseRounded";
import Box from "@mui/material/Box";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CheckboxFilterComponent,
  DateFilterComponent,
  DateRangeFilterComponent,
  DropdownFilterComponent,
  MoreFilters,
  RadioFilterComponent,
  RangeFilterComponent,
  SearchFilterComponent,
  SegmentedFilterComponent,
  ToggleFilterComponent,
} from "./components";
import type { DateRangeValue } from "./components/daterange-filter";
import type { RangeValue } from "./components/range-filter";
import type { FilterConfig } from "./types";
import { type FilterValue, useFilters } from "./use-filters";

export interface FiltersProps {
  options: FilterConfig[];
  /** Overflow filters that don't fit into a "More filters" popover. */
  responsive?: boolean;
  moreLabel?: string;
  /** Show removable chips for active filters. */
  showActiveFilters?: boolean;
  /** Show a "Clear all" action when any filter is active. */
  showClearAll?: boolean;
}

const GAP = 10;
const MORE_WIDTH = 130;
const BUFFER = 8;

// Rough width estimate per control, to decide inline vs overflow.
function widthEstimate(filter: FilterConfig): number {
  switch (filter.type) {
    case "search":
      return 300;
    case "segmented":
      return 40 + filter.options.length * 78;
    case "toggle":
      return 120;
    default:
      return 170;
  }
}

// Split filters into those that fit `containerWidth` and the overflow. Search
// filters always stay inline.
function splitFilters(options: FilterConfig[], containerWidth: number) {
  if (!containerWidth)
    return { visible: options, hidden: [] as FilterConfig[] };
  const visible: FilterConfig[] = [];
  const hidden: FilterConfig[] = [];
  let used = 0;
  for (const filter of options) {
    if (filter.type === "search") {
      visible.push(filter);
      used += widthEstimate(filter) + GAP;
      continue;
    }
    const needed =
      used +
      widthEstimate(filter) +
      GAP +
      (hidden.length === 0 ? MORE_WIDTH : 0);
    if (needed <= containerWidth - BUFFER) {
      visible.push(filter);
      used += widthEstimate(filter) + GAP;
    } else {
      hidden.push(filter);
    }
  }
  return { visible, hidden };
}

function isSet(value: unknown): boolean {
  return !(
    value == null ||
    value === "" ||
    (Array.isArray(value) && value.length === 0)
  );
}

function displayValue(config: FilterConfig, value: unknown): string {
  switch (config.type) {
    case "dropdown":
    case "radio":
    case "segmented":
      return (
        config.options.find((o) => o.value === value)?.label ?? String(value)
      );
    case "checkbox":
    case "multiselect":
      return Array.isArray(value)
        ? value
            .map((v) => config.options.find((o) => o.value === v)?.label ?? v)
            .join(", ")
        : String(value);
    case "toggle":
      return value ? "On" : "Off";
    case "daterange": {
      const r = value as DateRangeValue;
      return `${r?.from ?? "…"} – ${r?.to ?? "…"}`;
    }
    case "range": {
      const r = value as RangeValue;
      return `${r?.min ?? ""} – ${r?.max ?? ""}`;
    }
    default:
      return String(value);
  }
}

function control(
  filter: FilterConfig,
  filters: FilterValue,
  setFilter: (key: string, value: unknown) => void,
) {
  const value = filters[filter.key];
  const onChange = (v: unknown) => setFilter(filter.key, v);
  switch (filter.type) {
    case "search":
      return (
        <SearchFilterComponent
          config={filter}
          value={String(value ?? "")}
          onChange={onChange}
        />
      );
    case "segmented":
      return (
        <SegmentedFilterComponent
          config={filter}
          value={value as string | undefined}
          onChange={onChange}
        />
      );
    case "dropdown":
      return (
        <DropdownFilterComponent
          config={filter}
          value={value as string | undefined}
          onChange={onChange}
        />
      );
    case "radio":
      return (
        <RadioFilterComponent
          config={filter}
          value={value as string | undefined}
          onChange={onChange}
        />
      );
    case "checkbox":
    case "multiselect":
      return (
        <CheckboxFilterComponent
          config={filter}
          value={value as string[] | undefined}
          onChange={onChange}
        />
      );
    case "toggle":
      return (
        <ToggleFilterComponent
          config={filter}
          value={value as boolean | undefined}
          onChange={onChange}
        />
      );
    case "date":
      return (
        <DateFilterComponent
          config={filter}
          value={value as string | undefined}
          onChange={onChange}
        />
      );
    case "daterange":
      return (
        <DateRangeFilterComponent
          config={filter}
          value={value as DateRangeValue | undefined}
          onChange={onChange}
        />
      );
    case "range":
      return (
        <RangeFilterComponent
          config={filter}
          value={value as RangeValue | undefined}
          onChange={onChange}
        />
      );
    default:
      return null;
  }
}

// Config-driven filter bar: renders each filter with its own control component
// and manages state via useFilters (URL-synced). Optional active-filter chips
// and Clear All. Add a filter type by creating a control in ./components,
// exporting it, and wiring a case here.
export function Filters({
  options,
  responsive = false,
  moreLabel = "More filters",
  showActiveFilters = false,
  showClearAll = false,
}: FiltersProps) {
  const { filters, setFilter, clearFilter, clearAllFilters, hasActiveFilters } =
    useFilters();

  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (!responsive) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      setWidth(entries[0]?.contentRect.width ?? 0);
    });
    observer.observe(el);
    setWidth(el.offsetWidth);
    return () => observer.disconnect();
  }, [responsive]);

  const { visible, hidden } = useMemo(
    () =>
      responsive
        ? splitFilters(options, width)
        : { visible: options, hidden: [] },
    [responsive, options, width],
  );

  const activeChips = options
    .filter((f) => isSet(filters[f.key]))
    .map((f) => ({
      key: f.key,
      text: `${f.label?.name ?? f.key}: ${displayValue(f, filters[f.key])}`,
    }));

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <Box
        ref={containerRef}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexWrap: responsive ? "nowrap" : "wrap",
          overflow: responsive ? "hidden" : "visible",
        }}
      >
        {visible.map((filter) => (
          <Box key={filter.key}>{control(filter, filters, setFilter)}</Box>
        ))}
        {hidden.length ? (
          <MoreFilters
            filters={hidden}
            label={moreLabel}
            renderControl={(filter) => control(filter, filters, setFilter)}
          />
        ) : null}
        {showClearAll && hasActiveFilters ? (
          <Box
            onClick={clearAllFilters}
            sx={{
              fontSize: 12.5,
              fontWeight: 600,
              color: "#F0B27C",
              cursor: "pointer",
              px: "8px",
              "&:hover": { color: "#FF8A3C" },
            }}
          >
            Clear all
          </Box>
        ) : null}
      </Box>

      {showActiveFilters && activeChips.length ? (
        <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {activeChips.map((chip) => (
            <Box
              key={chip.key}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "6px",
                px: "10px",
                py: "4px",
                borderRadius: "999px",
                background: "rgba(255,255,255,.06)",
                border: "1px solid rgba(255,255,255,.12)",
                fontSize: 12,
                color: "#ECEAE7",
              }}
            >
              {chip.text}
              <CloseRounded
                onClick={() => clearFilter(chip.key)}
                sx={{
                  fontSize: 14,
                  cursor: "pointer",
                  color: "#9A968E",
                  "&:hover": { color: "#ECEAE7" },
                }}
              />
            </Box>
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
