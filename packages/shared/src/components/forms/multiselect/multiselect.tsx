"use client";

import { FieldShell } from "../field/field-shell";
import { SearchableSelectField } from "../select/searchable-select";
import type { SelectOption, WidgetProps } from "../types";

/** Multi-select type-ahead. Same option sourcing as `select` — static `enum` or
 * `optionSource` — but stores `string[]`. */
export function MultiSelectWidget({ prop, field, fieldState, t }: WidgetProps) {
  const options: SelectOption[] = (prop.enum ?? []).map((option, index) => ({
    value: String(option),
    label: t(prop.enumNames?.[index] ?? String(option)),
  }));

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <SearchableSelectField
        multiple
        value={Array.isArray(field.value) ? field.value : []}
        onChange={field.onChange}
        onBlur={field.onBlur}
        source={prop.optionSource}
        options={options}
        placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
        error={!!fieldState.error}
        noOptionsText={t("form.noOptions", "No match")}
        loadingText={t("form.loading", "Loading…")}
      />
    </FieldShell>
  );
}
