"use client";

import Typography, { type TypographyProps } from "@mui/material/Typography";
import delve from "dlv";
import { useFormatters } from "../../utils/format";

export interface NumberRendererConfig {
  type: "number";
  path: string;
  options?: Intl.NumberFormatOptions;
  prefix?: string;
  suffix?: string;
  variant?: TypographyProps["variant"];
  color?: TypographyProps["color"];
  sx?: TypographyProps["sx"];
}

export function NumberRenderer({
  config,
  data = {},
}: {
  config: NumberRendererConfig;
  data?: Record<string, unknown>;
}) {
  const { formatNumber } = useFormatters();
  const value = Number(delve(data, config.path) ?? 0);
  return (
    <Typography component="span" variant={config.variant} color={config.color} sx={config.sx}>
      {config.prefix ?? ""}
      {formatNumber(value, config.options)}
      {config.suffix ?? ""}
    </Typography>
  );
}
