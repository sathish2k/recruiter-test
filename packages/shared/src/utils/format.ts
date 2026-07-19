"use client";

import { useLocale } from "@recruit/sdk";
import { useMemo } from "react";

export function formatDate(
  value: Date | string | number,
  language: string,
  options?: Intl.DateTimeFormatOptions,
): string {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(
    language,
    options ?? { dateStyle: "medium" },
  ).format(date);
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
): string {
  return new Intl.NumberFormat(language, {
    style: "currency",
    currency,
  }).format(value);
}

export function useFormatters() {
  const { language } = useLocale();
  return useMemo(
    () => ({
      language,
      formatDate: (
        value: Date | string | number,
        options?: Intl.DateTimeFormatOptions,
      ) => formatDate(value, language, options),
      formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
        formatNumber(value, language, options),
      formatCurrency: (value: number, currency?: string) =>
        formatCurrency(value, language, currency),
    }),
    [language],
  );
}
