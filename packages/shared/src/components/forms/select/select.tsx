"use client";

import { useEffect } from "react";
import { useWatch } from "react-hook-form";
import { evalCondition } from "../conditions";
import { FieldShell } from "../field/field-shell";
import type { SelectOption, WidgetProps } from "../types";
import { SearchableSelectField } from "./searchable-select";
import { SelectField } from "./select-field";

/**
 * The `select` widget. Uses the type-ahead when the field is `searchable` or
 * sources options from the API; otherwise a plain menu, which reads better for
 * a handful of choices.
 */
export function SelectWidget({
  prop,
  field,
  fieldState,
  t,
  disabled,
  control,
  createOption,
}: WidgetProps & {
  /** Accent "create …" row pinned under the options (design behaviour). Passed
   * by the owning screen via the `widgets` override, since creating a record
   * is a screen concern, not a form-schema one. */
  createOption?: {
    label: (query: string) => string;
    icon?: string;
    onCreate: (query: string) => void;
    /** Keep the row visible whatever is typed. */
    persistent?: boolean;
  };
}) {
  const error = fieldState.error?.message ? t(fieldState.error.message) : undefined;
  // Only the fields the gates name are watched, so unrelated keystrokes don't
  // re-render this control.
  const gates = prop.optionEnabledWhen;
  const gateNames = gates ? [...new Set(Object.values(gates).map((gate) => gate.field))] : [];
  const watched = useWatch({
    control,
    name: gateNames.length ? gateNames : [" __none__"],
  }) as unknown[];
  const gateValues = Object.fromEntries(gateNames.map((name, index) => [name, watched[index]]));

  const options: SelectOption[] = (prop.enum ?? []).map((option, index) => {
    const raw = String(option);
    const label = prop.enumNames?.[index]
      ? t(prop.enumNames[index])
      : prop.enumL10n
        ? t(`${prop.enumL10n}.${raw || "none"}`)
        : t(raw);
    const locked = gates?.[raw] ? !evalCondition(gates[raw], gateValues) : false;
    return {
      value: raw,
      label,
      hint: locked && prop.optionDisabledHint ? t(prop.optionDisabledHint) : undefined,
      dot: prop.optionDots?.[raw],
      disabled: locked,
    };
  });

  // A gated select can hold a value its own fields no longer justify (the
  // default is "email" before an email is typed) or none at all (an older
  // record saved before the field existed). Either way, fall to the first
  // option the form has earned rather than showing an unpickable or blank one.
  const current = typeof field.value === "string" ? field.value : "";
  const firstOpen = options.find((option) => !option.disabled)?.value;
  const stranded =
    Boolean(gates) && !options.some((option) => option.value === current && !option.disabled);
  const { onChange } = field;
  useEffect(() => {
    if (stranded && firstOpen !== undefined) onChange(firstOpen);
  }, [stranded, firstOpen, onChange]);

  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={error}
    >
      {prop.optionSource || prop.searchable ? (
        <SearchableSelectField
          value={current}
          onChange={field.onChange}
          onBlur={field.onBlur}
          source={prop.optionSource}
          options={options}
          avatar={prop.avatar}
          disabled={disabled}
          icon={prop.icon}
          placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
          error={!!fieldState.error}
          emptyOption={prop.emptyOption ? { label: t(prop.emptyOption) } : undefined}
          createOption={createOption}
          noOptionsText={t("form.noOptions", "No match")}
          loadingText={t("form.loading", "Loading…")}
        />
      ) : (
        <SelectField
          value={current}
          onChange={field.onChange}
          onBlur={field.onBlur}
          options={options}
          disabled={disabled}
          look={prop.selectVariant}
          error={!!fieldState.error}
        />
      )}
    </FieldShell>
  );
}
