"use client";

import Autocomplete from "@mui/material/Autocomplete";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useMemo, useState } from "react";
import { avatarSwatch, initialsOf } from "../../../utils/avatar";
import { IconRenderer } from "../../renderers";
import type { OptionSource, SelectOption } from "../types";
import { useRemoteOptions } from "./remote-options";

export interface SearchableSelectFieldProps {
  /** `string` in single mode, `string[]` when `multiple`. */
  value: string | string[];
  onChange: (value: never) => void;
  /** Selects many; the value becomes an array. */
  multiple?: boolean;
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
  /** Small caption rendered inside the control, before the value. */
  prefix?: string;
  /** Render a coloured initials avatar beside each option and the chosen value. */
  avatar?: boolean;
}

/**
 * Type-ahead select backed by either a static list or an endpoint. With a
 * `source.searchParam` the server does the filtering (for lists too big to
 * ship); otherwise the list is fetched once and filtered here.
 */
export function SearchableSelectField({
  value,
  onChange,
  multiple,
  onBlur,
  options: staticOptions,
  source,
  placeholder,
  error,
  helperText,
  disabled,
  noOptionsText = "No match",
  loadingText = "Loading…",
  prefix,
  avatar,
}: SearchableSelectFieldProps) {
  const [search, setSearch] = useState("");
  const remote = useRemoteOptions(source, search);
  const options = source ? remote.options : (staticOptions ?? []);

  const selected = useMemo(() => {
    if (multiple) {
      const chosen = new Set(Array.isArray(value) ? value : []);
      return options.filter((option) => chosen.has(option.value));
    }
    return options.find((option) => option.value === value) ?? null;
  }, [options, value, multiple]);

  // A person picker draws the chosen contact's avatar inside the control.
  const single = !multiple && selected && !Array.isArray(selected) ? selected : null;
  const showAvatar = Boolean(avatar && single);

  const control = (
    <Autocomplete
      options={options}
      multiple={multiple}
      value={selected as never}
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
      onChange={(_, next) =>
        onChange(
          (Array.isArray(next)
            ? next.map((option) => option.value)
            : ((next as SelectOption | null)?.value ?? "")) as never,
        )
      }
      onInputChange={(_, next, reason) => {
        if (reason === "input") setSearch(next);
      }}
      onBlur={onBlur}
      renderOption={(props, option) => {
        const { key, ...rest } = props as { key?: string } & Record<string, unknown>;
        const swatch = avatar ? avatarSwatch(option.label) : null;
        const isSelected = multiple
          ? Array.isArray(value) && value.includes(option.value)
          : option.value === value;
        return (
          <Box
            component="li"
            key={option.value}
            {...rest}
            sx={{
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "9px 11px",
              borderRadius: "9px",
              color: "surface.textSecondary",
              // Match the plain Select menu's hover/selected treatment.
              "&.Mui-focused": { bgcolor: "surface.hover", color: "text.primary" },
              '&[aria-selected="true"]': { bgcolor: "surface.hover", color: "text.primary" },
              '&[aria-selected="true"].Mui-focused': { bgcolor: "surface.hover" },
            }}
          >
            {swatch ? (
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  fontSize: 9,
                  fontWeight: 600,
                  bgcolor: swatch.bg,
                  color: swatch.fg,
                  flex: "none",
                }}
              >
                {initialsOf(option.label)}
              </Avatar>
            ) : null}
            <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
              {option.label}
            </Box>
            {isSelected ? (
              <Box sx={{ color: "surface.accentBright", display: "flex", flex: "none" }}>
                <IconRenderer name="check" size={15} />
              </Box>
            ) : null}
          </Box>
        );
      }}
      renderInput={(params) => (
        // Spread params untouched — overriding the input slot breaks the ref
        // Autocomplete wires through it. Loading shows via `loadingText`.
        <TextField {...params} placeholder={placeholder} error={error} helperText={helperText} />
      )}
      // With a caption/avatar, reserve room for it rather than adorning the input.
      sx={
        prefix
          ? { "& .MuiAutocomplete-inputRoot": { pl: "52px" } }
          : showAvatar
            ? { "& .MuiAutocomplete-inputRoot": { pl: "44px" } }
            : undefined
      }
    />
  );

  if (!prefix && !showAvatar) return control;

  return (
    <Box sx={{ position: "relative" }}>
      {prefix ? (
        <Box
          component="span"
          sx={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            pointerEvents: "none",
            fontSize: 10.5,
            fontWeight: 600,
            letterSpacing: ".06em",
            color: "text.disabled",
          }}
        >
          {prefix}
        </Box>
      ) : null}
      {showAvatar && single ? (
        <Avatar
          sx={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            pointerEvents: "none",
            width: 26,
            height: 26,
            fontSize: 9.5,
            fontWeight: 600,
            bgcolor: avatarSwatch(single.label).bg,
            color: avatarSwatch(single.label).fg,
          }}
        >
          {initialsOf(single.label)}
        </Avatar>
      ) : null}
      {control}
    </Box>
  );
}
