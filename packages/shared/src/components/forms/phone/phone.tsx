"use client";

import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import Popover from "@mui/material/Popover";
import type { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
// The /max metadata is required — the default "min" build can't format most
// countries or check their lengths.
import examples from "libphonenumber-js/examples.mobile.json";
import { AsYouType, type CountryCode, getExampleNumber } from "libphonenumber-js/max";
import { useMemo, useState } from "react";
import { IconRenderer } from "../../renderers";
import { FieldShell } from "../field/field-shell";
import { useRemoteOptions } from "../select/remote-options";
import type { DialCode, OptionSource, WidgetProps } from "../types";

/** Per-country example: how long its national number is (used to cap input) and
 * a formatted sample (used as the placeholder). Cached across renders. */
const metaCache = new Map<string, { maxLen: number; placeholder: string }>();
function countryMeta(iso?: string): { maxLen: number; placeholder: string } | undefined {
  if (!iso) return undefined;
  const cached = metaCache.get(iso);
  if (cached) return cached;
  try {
    const sample = getExampleNumber(
      iso as CountryCode,
      examples as Parameters<typeof getExampleNumber>[1],
    );
    if (!sample) return undefined;
    const meta = { maxLen: sample.nationalNumber.length, placeholder: sample.formatNational() };
    metaCache.set(iso, meta);
    return meta;
  } catch {
    return undefined;
  }
}

/** Formats the national number the way the selected country writes it — e.g.
 * `98450 12340` (IN), `07400 123456` (GB) — and caps it to that country's own
 * length, so `+91` accepts only 10 digits. Caps against the *parsed* national
 * length so a trunk prefix a user types (GB's leading 0) isn't miscounted. */
function formatNational(raw: string, iso: string): string {
  let digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  const max = countryMeta(iso)?.maxLen;
  const run = (value: string) => {
    const asYouType = new AsYouType(iso as CountryCode);
    const text = asYouType.input(value);
    return { text, nationalLen: asYouType.getNumber()?.nationalNumber.length ?? value.length };
  };
  try {
    let out = run(digits);
    while (max && digits.length > 1 && out.nationalLen > max) {
      digits = digits.slice(0, -1);
      out = run(digits);
    }
    return out.text;
  } catch {
    return digits;
  }
}

/** Dial codes from the design's CODES table. Override per-field with
 * `dialCodes` when a form needs a different set. */
export const DIAL_CODES: DialCode[] = [
  { iso: "IN", code: "+91", country: "India" },
  { iso: "US", code: "+1", country: "United States" },
  { iso: "GB", code: "+44", country: "United Kingdom" },
  { iso: "AE", code: "+971", country: "United Arab Emirates" },
  { iso: "SG", code: "+65", country: "Singapore" },
  { iso: "DE", code: "+49", country: "Germany" },
  { iso: "AU", code: "+61", country: "Australia" },
  { iso: "CA", code: "+1", country: "Canada" },
];

/**
 * Splits a stored `+91 98450 12340` into its dial code and the rest. With an
 * empty value it falls back to `defaultIso` — the full country list is sorted
 * alphabetically, so `codes[0]` would silently mean Afghanistan.
 */
export function splitPhone(value: string, codes: DialCode[], defaultIso = "IN") {
  const trimmed = (value ?? "").trim();
  // Longest prefix first, so +91 doesn't shadow +9 style entries.
  const sorted = [...codes].sort((a, b) => b.code.length - a.code.length);
  const hit = sorted.find((c) => c.code && trimmed.startsWith(c.code));
  if (hit) return { dial: hit, number: trimmed.slice(hit.code.length).trim() };
  const fallback = codes.find((c) => c.iso === defaultIso) ?? codes[0];
  return { dial: fallback as DialCode, number: trimmed };
}

export interface PhoneFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  codes?: DialCode[];
  /** Fetches the dial codes from the API instead of using `codes`. */
  source?: OptionSource;
  error?: boolean;
  searchPlaceholder?: string;
  /** Already translated. */
  noMatchLabel?: string;
  /** Country selected when the value is empty. */
  defaultIso?: string;
}

/** Dial-code picker + number input. Stores one string: `+91 98450 12340`. */
export function PhoneField({
  value,
  onChange,
  onBlur,
  placeholder,
  codes,
  source,
  error,
  searchPlaceholder = "Search country or code…",
  noMatchLabel = "No match",
  defaultIso = "IN",
}: PhoneFieldProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState("");

  // Remote rows carry iso/code/country on `raw`; fall back to the bundled list
  // so the field still works with no API behind it.
  const remote = useRemoteOptions(source, "");
  const resolved: DialCode[] = useMemo(() => {
    if (source && remote.options.length) {
      return remote.options.map((option) => {
        const row = (option.raw ?? {}) as Partial<DialCode>;
        return {
          iso: row.iso ?? option.value,
          code: row.code ?? option.value,
          country: row.country ?? option.label,
        };
      });
    }
    return codes ?? DIAL_CODES;
  }, [source, remote.options, codes]);

  const { dial, number } = useMemo(
    () => splitPhone(value ?? "", resolved, defaultIso),
    [value, resolved, defaultIso],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return resolved;
    return resolved.filter(
      (c) =>
        c.country.toLowerCase().includes(q) ||
        c.code.includes(q) ||
        c.iso.toLowerCase().includes(q),
    );
  }, [resolved, query]);

  const commit = (nextDial: DialCode, nextNumber: string) =>
    onChange(`${nextDial.code} ${nextNumber}`.trim());

  // Placeholder mirrors the selected country's own format.
  const countryPlaceholder = countryMeta(dial?.iso ?? defaultIso)?.placeholder;

  const boxSx = {
    // `bgcolor`, not `background` — the shorthand doesn't resolve palette paths
    // in sx, which left both halves of this control transparent.
    bgcolor: "surface.inset",
    border: "1px solid",
    borderColor: error ? "error.main" : "surface.controlBorder",
    borderRadius: (theme: Theme) => theme.form.controlRadius,
    fontSize: 13.5,
    // Both halves size off their text's natural line box; the inherited 1.5
    // would push this control taller than every other one on the form.
    lineHeight: "normal",
  } as const;

  return (
    <Box sx={{ display: "flex", gap: "8px" }}>
      <Box
        onClick={(e) => setAnchor(e.currentTarget)}
        sx={{
          ...boxSx,
          display: "flex",
          alignItems: "center",
          gap: "7px",
          px: "12px",
          py: "11px",
          fontWeight: 600,
          cursor: "pointer",
          flex: "none",
          whiteSpace: "nowrap",
          "&:hover": { borderColor: "primary.main" },
        }}
      >
        <Box
          component="span"
          sx={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: ".04em",
            // Hugs its text; the inherited 1.5 would make the country chip
            // taller than the number field beside it.
            lineHeight: 1,
            color: "text.secondary",
            bgcolor: "surface.tint",
            borderRadius: "5px",
            px: "5px",
            py: "2px",
          }}
        >
          {dial?.iso}
        </Box>
        {dial?.code}
        <IconRenderer name="expand-more" size={15} sx={{ color: "text.disabled" }} />
      </Box>

      <InputBase
        value={number}
        onChange={(e) => commit(dial, formatNational(e.target.value, dial?.iso ?? defaultIso))}
        onBlur={onBlur}
        placeholder={countryPlaceholder ?? placeholder}
        sx={{
          ...boxSx,
          flex: 1,
          minWidth: 0,
          px: (theme) => theme.form.controlPadX,
          py: (theme) => theme.form.controlPadY,
          // The wrapper owns the padding; without this the inner input adds
          // MUI's own on top, and its 1.4375em sets the height instead.
          "& .MuiInputBase-input": { p: 0, height: "auto", lineHeight: "normal" },
        }}
      />

      <Popover
        open={!!anchor}
        anchorEl={anchor}
        onClose={() => {
          setAnchor(null);
          setQuery("");
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        slotProps={{ paper: { sx: { width: 270, p: "6px", mt: "6px", borderRadius: "13px" } } }}
      >
        <Box
          sx={{
            ...boxSx,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            px: "10px",
            py: "8px",
            mb: "6px",
            borderRadius: "9px",
          }}
        >
          <IconRenderer name="search" size={16} sx={{ color: "text.disabled" }} />
          <InputBase
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            sx={{ fontSize: 12.5, flex: 1 }}
          />
        </Box>
        <Box sx={{ maxHeight: 200, overflowY: "auto" }}>
          {filtered.map((c) => (
            <Box
              key={`${c.iso}-${c.code}`}
              onClick={() => {
                // Re-format the existing digits the new country's way.
                commit(c, formatNational(number, c.iso));
                setAnchor(null);
                setQuery("");
              }}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: "9px",
                px: "10px",
                py: "8px",
                borderRadius: "9px",
                cursor: "pointer",
                "&:hover": { bgcolor: "surface.hover" },
              }}
            >
              <Box
                component="span"
                sx={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: "text.secondary",
                  bgcolor: "surface.tint",
                  borderRadius: "5px",
                  px: "5px",
                  py: "2px",
                }}
              >
                {c.iso}
              </Box>
              <Typography sx={{ fontSize: 12.5, flex: 1 }}>{c.country}</Typography>
              <Typography sx={{ fontSize: 12.5, color: "text.disabled" }}>{c.code}</Typography>
            </Box>
          ))}
          {filtered.length === 0 ? (
            <Typography sx={{ fontSize: 12, color: "text.disabled", p: "10px" }}>
              {noMatchLabel}
            </Typography>
          ) : null}
        </Box>
      </Popover>
    </Box>
  );
}

/** The `phone` widget. */
export function PhoneWidget({ prop, field, fieldState, t }: WidgetProps) {
  return (
    <FieldShell
      label={t(prop.title ?? "")}
      hideLabel={prop.hideLabel}
      help={prop.help ? t(prop.help) : undefined}
      error={fieldState.error?.message ? t(fieldState.error.message) : undefined}
    >
      <PhoneField
        value={typeof field.value === "string" ? field.value : ""}
        onChange={field.onChange}
        onBlur={field.onBlur}
        placeholder={prop.placeholder ? t(prop.placeholder) : undefined}
        codes={prop.dialCodes}
        source={prop.optionSource}
        error={!!fieldState.error}
        searchPlaceholder={t("form.searchCountry", "Search country or code…")}
        defaultIso={prop.defaultIso}
        noMatchLabel={t("form.noOptions", "No match")}
      />
    </FieldShell>
  );
}
