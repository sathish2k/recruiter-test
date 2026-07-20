"use client";

import Typography, { type TypographyProps } from "@mui/material/Typography";
import delve from "dlv";
import { useFormatters } from "../../utils/format";

export interface CurrencyRendererConfig {
  type: "currency";
  path: string;
  /** Static currency code, or read it from data via currencyPath. */
  currency?: string;
  currencyPath?: string;
  variant?: TypographyProps["variant"];
  color?: TypographyProps["color"];
  sx?: TypographyProps["sx"];
}

export function CurrencyRenderer({
  config,
  data = {},
}: {
  config: CurrencyRendererConfig;
  data?: Record<string, unknown>;
}) {
  const { formatCurrency } = useFormatters();
  const value = Number(delve(data, config.path) ?? 0);
  const currency = config.currencyPath
    ? String(delve(data, config.currencyPath) ?? config.currency ?? "USD")
    : (config.currency ?? "USD");
  return (
    <Typography component="span" variant={config.variant} color={config.color} sx={config.sx}>
      {formatCurrency(value, currency)}
    </Typography>
  );
}
