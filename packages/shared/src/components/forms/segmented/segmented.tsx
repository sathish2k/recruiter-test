"use client";

import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { FieldShell } from "../field/field-shell";
import type { WidgetProps } from "../types";

/** Themed pill tabs over a small `enum`. */
export function SegmentedWidget({ prop, field, fieldState, t }: WidgetProps) {
  const options = prop.enum ?? [];
  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <Tabs
        variant="segmented"
        value={field.value || (options[0] ?? "")}
        onChange={(_, next) => field.onChange(next)}
      >
        {options.map((option, index) => (
          <Tab
            key={String(option)}
            value={option}
            label={t(prop.enumNames?.[index] ?? String(option))}
          />
        ))}
      </Tabs>
    </FieldShell>
  );
}
