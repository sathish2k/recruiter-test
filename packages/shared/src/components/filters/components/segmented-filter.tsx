"use client";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import type { SegmentedFilter } from "../types";

export function SegmentedFilterComponent({
  config,
  value,
  onChange,
}: {
  config: SegmentedFilter;
  value: string | undefined;
  onChange: (value: string) => void;
}) {
  const active = value ?? config.options[0]?.value;
  return (
    <Tabs value={active} onChange={(_, next) => onChange(next)}>
      {config.options.map((option) => (
        <Tab
          key={option.value}
          value={option.value}
          label={
            option.count != null
              ? `${option.label} (${option.count})`
              : option.label
          }
        />
      ))}
    </Tabs>
  );
}
