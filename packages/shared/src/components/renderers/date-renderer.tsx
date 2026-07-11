"use client";

import Typography, { type TypographyProps } from "@mui/material/Typography";
import delve from "dlv";
import { useFormatters } from "../../utils/format";

export interface DateRendererConfig {
  type: "date";
  path: string;
  options?: Intl.DateTimeFormatOptions;
  variant?: TypographyProps["variant"];
  color?: TypographyProps["color"];
  placeholder?: string;
}

export function DateRenderer({
  config,
  data = {},
}: {
  config: DateRendererConfig;
  data?: Record<string, unknown>;
}) {
  const { formatDate } = useFormatters();
  const raw = delve(data, config.path);
  return (
    <Typography component="span" variant={config.variant} color={config.color}>
      {raw
        ? formatDate(raw as string | number | Date, config.options)
        : (config.placeholder ?? "")}
    </Typography>
  );
}
