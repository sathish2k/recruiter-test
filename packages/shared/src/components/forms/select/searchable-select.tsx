"use client";

import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import FormHelperText from "@mui/material/FormHelperText";
import InputBase from "@mui/material/InputBase";
import Menu from "@mui/material/Menu";
import { useMemo, useRef, useState } from "react";
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
  /** ICON_REGISTRY name drawn inside the control, before the value — the
   * design`s Primary contact / Account manager pickers. */
  icon?: string;
  /** Render a coloured initials avatar beside each option and the chosen value. */
  avatar?: boolean;
  /** Leading "none" row that clears the field ("No parent company"). */
  emptyOption?: { label: string };
  /**
   * Accent row pinned under the options, as the design draws it —
   * `Create "{query}" as parent company`. `label` receives the typed query so
   * the caller owns the copy and its translation.
   */
  createOption?: {
    label: (query: string) => string;
    icon?: string;
    onCreate: (query: string) => void;
    /** Pin the row open regardless of what is typed — the design offers
     * "Create new client" as a standing option, not only a fallback for a
     * query that matched nothing. */
    persistent?: boolean;
  };
}

/**
 * Type-ahead select backed by either a static list or an endpoint. The search
 * box lives **inside** the dropdown (as the design draws it) rather than in the
 * control, so the control always shows the chosen label. With a
 * `source.searchParam` the server filters; otherwise filtering happens here.
 *
 * Deliberately not an MUI Autocomplete: that puts the query in the control and
 * requires `renderInput`, whose input slot must never be overridden — see the
 * `check:autocomplete` guard.
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
  icon,
  avatar,
  emptyOption,
  createOption,
}: SearchableSelectFieldProps) {
  const [search, setSearch] = useState("");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const controlRef = useRef<HTMLDivElement>(null);
  const remote = useRemoteOptions(source, search);
  const all = source ? remote.options : (staticOptions ?? []);

  // The server already filtered when it owns the search.
  const options = useMemo(
    () => all.filter((option) => matchesSearch(option.label, search.trim(), source)),
    [all, search, source],
  );

  const chosen = useMemo(
    () => new Set(multiple ? (Array.isArray(value) ? value : []) : [value as string]),
    [value, multiple],
  );
  const single = multiple ? null : (all.find((option) => option.value === value) ?? null);
  const selectedLabels = multiple
    ? all.filter((option) => chosen.has(option.value)).map((option) => option.label)
    : [];

  const close = () => {
    setAnchor(null);
    setSearch("");
    onBlur?.();
  };

  const pick = (optionValue: string) => {
    if (multiple) {
      const next = new Set(chosen);
      if (next.has(optionValue)) next.delete(optionValue);
      else next.add(optionValue);
      onChange([...next] as never);
      return;
    }
    onChange(optionValue as never);
    close();
  };

  // The design only offers to create once the query is more than a character
  // and matches no existing option — otherwise the row reads `Create ""`.
  const query = search.trim();
  const canCreate =
    Boolean(createOption) &&
    (createOption?.persistent || query.length > 1) &&
    !all.some((option) => option.label.toLowerCase() === query.toLowerCase());

  const showNoneRow =
    Boolean(emptyOption) && !multiple && matchesSearch(emptyOption?.label ?? "", query, source);

  const swatch = avatar && single ? avatarSwatch(single.label) : undefined;
  const display = multiple
    ? selectedLabels.join(", ")
    : (single?.label ?? (value ? "" : (emptyOption?.label ?? "")));

  return (
    <>
      <Box
        ref={controlRef}
        onClick={() => {
          if (!disabled) setAnchor(controlRef.current);
        }}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          bgcolor: "surface.inset",
          border: "1px solid",
          borderColor: error ? "error.main" : "surface.controlBorder",
          borderRadius: (theme) => theme.form.controlRadius,
          // Raw tokens, no +1px: unlike the outlined input this control has a
          // real border, which already adds the design's extra 2px of height.
          py: (theme) => theme.form.controlPadY,
          px: (theme) => theme.form.controlPadX,
          fontSize: 13.5,
          cursor: disabled ? "default" : "pointer",
          opacity: disabled ? 0.6 : 1,
          "&:hover": { borderColor: disabled ? undefined : "surface.borderStrong" },
        }}
      >
        {icon ? (
          <Box sx={{ color: "surface.textDisabled", flex: "none", display: "flex" }}>
            <IconRenderer name={icon} size={17} />
          </Box>
        ) : null}
        {prefix ? (
          <Box component="span" sx={{ color: "text.disabled", flex: "none" }}>
            {prefix}
          </Box>
        ) : null}
        {single?.dot ? (
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "999px",
              background: single.dot,
              flex: "none",
            }}
          />
        ) : null}
        {swatch && single ? (
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
            {initialsOf(single.label)}
          </Avatar>
        ) : null}
        <Box
          component="span"
          sx={{
            flex: 1,
            minWidth: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            color: display ? "text.primary" : "text.disabled",
          }}
        >
          {display || placeholder}
        </Box>
        <IconRenderer
          name={anchor ? "expand-less" : "expand-more"}
          size={16}
          color="var(--mui-palette-surface-textDisabled)"
        />
      </Box>
      {helperText ? <FormHelperText error={error}>{helperText}</FormHelperText> : null}

      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        transformOrigin={{ vertical: "top", horizontal: "left" }}
        slotProps={{
          paper: {
            sx: {
              mt: "6px",
              borderRadius: "13px",
              bgcolor: "surface.dropdownPanel",
              borderColor: "surface.border",
              width: controlRef.current?.offsetWidth,
            },
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            mb: "6px",
            p: "8px 10px",
            bgcolor: "surface.inset",
            border: "1px solid",
            borderColor: "surface.controlBorder",
            borderRadius: "9px",
          }}
        >
          <IconRenderer name="search" size={16} color="var(--mui-palette-surface-textDisabled)" />
          <InputBase
            autoFocus
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={placeholder}
            sx={{ flex: 1, fontSize: 12.5, color: "text.primary" }}
          />
        </Box>

        <Box sx={{ maxHeight: 190, overflowY: "auto", display: "flex", flexDirection: "column" }}>
          {showNoneRow && emptyOption ? (
            <OptionRow label={emptyOption.label} selected={!value} onPick={() => pick("")} />
          ) : null}

          {remote.loading ? (
            <Box sx={EMPTY_SX}>{loadingText}</Box>
          ) : options.length === 0 && !showNoneRow ? (
            <Box sx={EMPTY_SX}>{noOptionsText}</Box>
          ) : (
            options.map((option) => (
              <OptionRow
                key={option.value}
                label={option.label}
                selected={chosen.has(option.value)}
                swatch={avatar ? avatarSwatch(option.label) : undefined}
                onPick={() => pick(option.value)}
              />
            ))
          )}
        </Box>

        {canCreate && createOption ? (
          <Box sx={{ height: "1px", bgcolor: "surface.divider", m: "6px 4px" }} />
        ) : null}
        {canCreate && createOption ? (
          <Box
            onClick={() => {
              createOption.onCreate(search);
              close();
            }}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
              p: "9px 11px",
              borderRadius: "9px",
              fontSize: 12.5,
              fontWeight: 600,
              color: "surface.primarySoftFg",
              cursor: "pointer",
              "&:hover": { bgcolor: "surface.optionSelectedBg" },
            }}
          >
            <IconRenderer name={createOption.icon ?? "add"} size={16} color="inherit" />
            {createOption.label(search)}
          </Box>
        ) : null}
      </Menu>
    </>
  );
}

/** Client-side match test, skipped when the server owns the search. */
function matchesSearch(label: string, query: string, source?: OptionSource): boolean {
  if (source?.searchParam || !query) return true;
  return label.toLowerCase().includes(query.toLowerCase());
}

/** Loading and no-match rows, which the design centres rather than indents. */
const EMPTY_SX = {
  p: "12px 10px",
  textAlign: "center",
  fontSize: 12,
  color: "surface.textDisabled",
} as const;

/** One row of the dropdown. Selected rows take the accent tint + tick. */
function OptionRow({
  label,
  selected,
  dot,
  swatch,
  onPick,
}: {
  label: string;
  selected: boolean;
  dot?: string;
  swatch?: { bg: string; fg: string };
  onPick: () => void;
}) {
  return (
    <Box
      onClick={onPick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        p: "9px 11px",
        borderRadius: "9px",
        fontSize: 13,
        cursor: "pointer",
        color: "text.primary",
        bgcolor: selected ? "surface.optionSelectedBg" : "transparent",
        "&:hover": { bgcolor: selected ? "surface.optionSelectedBg" : "surface.hover" },
      }}
    >
      {dot ? (
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "999px",
            background: dot,
            flex: "none",
          }}
        />
      ) : null}
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
          {initialsOf(label)}
        </Avatar>
      ) : null}
      <Box component="span" sx={{ flex: 1, minWidth: 0 }}>
        {label}
      </Box>
      {selected ? (
        <Box sx={{ color: "surface.accentBright", display: "flex", flex: "none" }}>
          <IconRenderer name="check" size={15} />
        </Box>
      ) : null}
    </Box>
  );
}
