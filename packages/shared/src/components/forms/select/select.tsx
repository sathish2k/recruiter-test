"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { FieldShell } from "../field/field-shell";
import type { OptionSource, SelectOption, WidgetProps } from "../types";
import { useRemoteOptions } from "./remote-options";

export interface SearchableSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  /** Options already known (a schema `enum`). Ignored when `source` is set. */
  options?: SelectOption[];
  /** Where to fetch options from. */
  source?: OptionSource;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  disabled?: boolean;
  noOptionsText?: string;
  loadingText?: string;
}

/**
 * Type-ahead select backed by either a static list or an endpoint. With a
 * `source.searchParam` the server does the filtering (for lists too big to
 * ship); otherwise the list is fetched once and filtered here.
 */
export function SearchableSelectField({
  value,
  onChange,
  onBlur,
  options: staticOptions,
  source,
  placeholder,
  error,
  helperText,
  disabled,
  noOptionsText = "No match",
  loadingText = "Loading…",
}: SearchableSelectFieldProps) {
  const [search, setSearch] = useState("");
  const remote = useRemoteOptions(source, search);
  const options = source ? remote.options : (staticOptions ?? []);

  const selected = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value],
  );

  return (
    <Autocomplete
      options={options}
      value={selected}
      openOnFocus
      selectOnFocus
      handleHomeEndKeys
      // A half-typed term shouldn't linger once focus leaves.
      clearOnBlur
      disabled={disabled}
      loading={remote.loading}
      loadingText={loadingText}
      noOptionsText={noOptionsText}
      // The server already filtered when it owns the search.
      filterOptions={source?.searchParam ? (all) => all : undefined}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, current) => option.value === current.value}
      onChange={(_, next) => onChange(next?.value ?? "")}
      onInputChange={(_, next, reason) => {
        if (reason === "input") setSearch(next);
      }}
      onBlur={onBlur}
      renderOption={(props, option) => {
        const { key, ...rest } = props as { key?: string } & Record<string, unknown>;
        return (
          <Box component="li" key={option.value} {...rest} sx={{ fontSize: 13 }}>
            {option.label}
          </Box>
        );
      }}
      renderInput={(params) => (
        // Spread params untouched — overriding the input slot breaks the ref
        // Autocomplete wires through it. Loading shows via `loadingText`.
        <TextField {...params} placeholder={placeholder} error={error} helperText={helperText} />
      )}
    />
  );
}

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
          placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
          error={!!fieldState.error}
          noOptionsText={t("form.noOptions", "No match")}
          loadingText={t("form.loading", "Loading…")}
        />
      ) : (
        <TextField
          select
          fullWidth
          hiddenLabel
          value={field.value ?? ""}
          onChange={field.onChange}
          onBlur={field.onBlur}
          error={!!fieldState.error}
        >
          {options.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    </FieldShell>
  );
}
