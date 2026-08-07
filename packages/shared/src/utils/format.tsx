"use client";

import { useLocale } from "@recruit/sdk";
import { useMemo } from "react";

interface DateFormatPrefs {
  dateFormat?: string;
  timeFormat?: string;
  timezone?: string;
}

const is12Hour = (timeFormat?: string) => !!timeFormat && timeFormat.startsWith("12");

/** Builds a date string from the user's chosen pattern. Only these four are
 * offered (matching the workspace enum); the parts are resolved in the user's
 * timezone and the short month name stays locale-aware. */
function formatDatePattern(
  date: Date,
  language: string,
  dateFormat: string,
  timeZone?: string,
): string {
  const parts = new Intl.DateTimeFormat(language, {
    timeZone,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).formatToParts(date);
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  const dd = get("day");
  const mm = get("month");
  const yyyy = get("year");
  const mmm = new Intl.DateTimeFormat(language, { timeZone, month: "short" }).format(date);
  switch (dateFormat) {
    case "DD/MM/YYYY":
      return `${dd}/${mm}/${yyyy}`;
    case "MM/DD/YYYY":
      return `${mm}/${dd}/${yyyy}`;
    case "YYYY-MM-DD":
      return `${yyyy}-${mm}-${dd}`;
    default:
      return `${dd} ${mmm} ${yyyy}`;
  }
}

export function formatDate(
  value: Date | string | number,
  language: string,
  options?: Intl.DateTimeFormatOptions,
  prefs?: DateFormatPrefs,
): string {
  const date = value instanceof Date ? value : new Date(value);
  const timeZone = prefs?.timezone;
  if (options) {
    // Explicit Intl options win; fill in the timezone and `hour12` from prefs
    // only where the caller left them open.
    const showsTime = options.hour !== undefined || options.timeStyle !== undefined;
    const merged: Intl.DateTimeFormatOptions = {
      ...options,
      ...(timeZone && options.timeZone === undefined ? { timeZone } : {}),
      ...(showsTime && prefs?.timeFormat && options.hour12 === undefined
        ? { hour12: is12Hour(prefs.timeFormat) }
        : {}),
    };
    return new Intl.DateTimeFormat(language, merged).format(date);
  }
  if (prefs?.dateFormat) return formatDatePattern(date, language, prefs.dateFormat, timeZone);
  return new Intl.DateTimeFormat(language, { dateStyle: "medium", timeZone }).format(date);
}

export function formatNumber(
  value: number,
  language: string,
  options?: Intl.NumberFormatOptions,
): string {
  return new Intl.NumberFormat(language, options).format(value);
}

export function formatCurrency(
  value: number,
  language: string,
  currency = "USD",
  compact = false,
): string {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency,
    // Large money on a small tile: the design abbreviates rather than wraps.
    ...(compact ? { notation: "compact" as const, maximumFractionDigits: 1 } : {}),
  }).format(value);
}

/**
 * Locale-aware formatters that honor the user's localStorage preferences
 * (language, timezone, date/time format) from `useLocale` — set on the account
 * screen and read across the portal, no extra provider or fetch.
 */
export function useFormatters() {
  const { language, timezone, dateFormat, timeFormat } = useLocale();
  return useMemo(
    () => ({
      language,
      formatDate: (value: Date | string | number, options?: Intl.DateTimeFormatOptions) =>
        formatDate(value, language, options, { dateFormat, timeFormat, timezone }),
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
        formatNumber(value, language, options),
      formatCurrency: (value: number, currency?: string, compact?: boolean) =>
        formatCurrency(value, language, currency, compact),
    }),
    [language, timezone, dateFormat, timeFormat],
  );
}
