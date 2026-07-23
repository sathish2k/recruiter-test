"use client";

import { FieldShell } from "../field/field-shell";
import type { SelectOption, WidgetProps } from "../types";
import { SearchableSelectField } from "./searchable-select";
import { SelectField } from "./select-field";

/**
 * The `select` widget. Uses the type-ahead when the field is `searchable` or
 * sources options from the API; otherwise a plain menu, which reads better for
 * a handful of choices.
 */
export function SelectWidget({ prop, field, fieldState, t }: WidgetProps) {
  const error = fieldState.error?.message ? t(fieldState.error.message) : undefined;
  const options: SelectOption[] = (prop.enum ?? []).map((option, index) => ({
    value: String(option),
    label: t(prop.enumNames?.[index] ?? String(option)),
  }));

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={error}
    >
      {prop.optionSource || prop.searchable ? (
        <SearchableSelectField
          value={typeof field.value === "string" ? field.value : ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          source={prop.optionSource}
          options={options}
          avatar={prop.avatar}
          placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
          error={!!fieldState.error}
          noOptionsText={t("form.noOptions", "No match")}
          loadingText={t("form.loading", "Loading…")}
        />
      ) : (
        <SelectField
          value={typeof field.value === "string" ? field.value : ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          options={options}
          error={!!fieldState.error}
        />
      )}
    </FieldShell>
  );
}
