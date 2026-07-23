"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import { useEffect, useMemo, useRef, useState } from "react";
import { IconRenderer } from "../renderers";
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
  clearAllLabel?: string;
}

const GAP = 10;
const MORE_WIDTH = 130;
const BUFFER = 8;

function widthEstimate(filter: FilterConfig): number {
  switch (filter.type) {
    case "search":
      return filter.width ?? 300;
    case "segmented":
      return 40 + filter.options.length * 78;
    case "toggle":
      return 132;
    default:
      // Matches the trigger's own min/max window, so the overflow split
      // doesn't under-count and leave a filter clipped.
      return 176;
  }
}

function splitFilters(options: FilterConfig[], containerWidth: number) {
  if (!containerWidth) return { visible: options, hidden: [] as FilterConfig[] };
  const visible: FilterConfig[] = [];
  const hidden: FilterConfig[] = [];
  let used = 0;
  for (const filter of options) {
    if (filter.type === "search") {
      visible.push(filter);
      used += widthEstimate(filter) + GAP;
      continue;
    }
    const needed = used + widthEstimate(filter) + GAP + (hidden.length === 0 ? MORE_WIDTH : 0);
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
  return !(value == null || value === "" || (Array.isArray(value) && value.length === 0));
}

function displayValue(config: FilterConfig, value: unknown): string {
  switch (config.type) {
    case "dropdown":
    case "radio":
    case "segmented":
      return (config.options ?? []).find((o) => o.value === value)?.label ?? String(value);
    case "checkbox":
    case "select":
      return Array.isArray(value)
        ? value.map((v) => (config.options ?? []).find((o) => o.value === v)?.label ?? v).join(", ")
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
  const active = isSet(value);
  switch (filter.type) {
    case "search":
      return (
        <SearchFilterComponent config={filter} value={String(value ?? "")} onChange={onChange} />
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
          active={active}
        />
      );
    case "radio":
      return (
        <RadioFilterComponent
          config={filter}
          value={value as string | undefined}
          onChange={onChange}
          active={active}
        />
      );
    case "checkbox":
    case "select":
      return (
        <CheckboxFilterComponent
          config={filter}
          value={value as string[] | undefined}
          onChange={onChange}
          active={active}
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
          active={active}
        />
      );
    case "daterange":
      return (
        <DateRangeFilterComponent
          config={filter}
          value={value as DateRangeValue | undefined}
          onChange={onChange}
          active={active}
        />
      );
    case "range":
      return (
        <RangeFilterComponent
          config={filter}
          value={value as RangeValue | undefined}
          onChange={onChange}
          active={active}
        />
      );
    default:
      return null;
  }
}

export function Filters({
  options,
  responsive = false,
  moreLabel = "More filters",
  showActiveFilters = false,
  showClearAll = false,
  clearAllLabel = "Clear all",
}: FiltersProps) {
  const { filters, setFilter, clearFilter, clearAllFilters, hasActiveFilters } = useFilters();

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
    () => (responsive ? splitFilters(options, width) : { visible: options, hidden: [] }),
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
            activeCount={hidden.filter((f) => isSet(filters[f.key])).length}
            values={filters}
            renderControl={(filter, draft, set) => control(filter, draft, set)}
            onApply={(draft) => {
              for (const filter of hidden) setFilter(filter.key, draft[filter.key]);
            }}
            onReset={() => {
              for (const filter of hidden) clearFilter(filter.key);
            }}
          />
        ) : null}
        {showClearAll && hasActiveFilters ? (
          <Button
            variant="text"
            size="small"
            onClick={clearAllFilters}
            startIcon={<IconRenderer name="close" size={14} />}
            sx={{
              ml: "auto",
              flex: "none",
              fontSize: 12.5,
              fontWeight: 600,
              color: "surface.primarySoftFg",
              "&:hover": { color: "primary.light" },
            }}
          >
            {clearAllLabel}
          </Button>
        ) : null}
      </Box>

      {showActiveFilters && activeChips.length ? (
        <Box sx={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {activeChips.map((chip) => (
            <Chip
              key={chip.key}
              variant="soft"
              size="small"
              label={chip.text}
              onDelete={() => clearFilter(chip.key)}
            />
          ))}
        </Box>
      ) : null}
    </Box>
  );
}
