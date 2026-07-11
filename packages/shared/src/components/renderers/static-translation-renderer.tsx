"use client";

import Typography, { type TypographyProps } from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import delve from "dlv";

export interface StaticTranslationRendererConfig {
  type: "static-translation";
  /** Component id whose translation the key resolves against. */
  id: string;
  /** Translation key. The resolved string may contain a `{value}` placeholder. */
  key: string;
  /** Path into data for the dynamic value combined with the translation. */
  value?: string;
  variant?: TypographyProps["variant"];
  color?: TypographyProps["color"];
  sx?: TypographyProps["sx"];
}

// Combines a translated string (by `key`) with a dynamic value read from `data`
// at `value`. If the translation contains `{value}` the value is interpolated
// there; otherwise it's appended.
export function StaticTranslationRenderer({
  config,
  data = {},
}: {
  config: StaticTranslationRendererConfig;
  data?: Record<string, unknown>;
}) {
  const { t } = useTranslation(config.id);
  const template = t(config.key);
  const dynamic = config.value != null ? delve(data, config.value) : undefined;
  const text =
    dynamic == null
      ? template
      : template.includes("{value}")
        ? template.replace(/\{value\}/g, String(dynamic))
        : `${template} ${dynamic}`;

  return (
    <Typography
      component="span"
      variant={config.variant}
      color={config.color}
      sx={config.sx}
    >
      {text}
    </Typography>
  );
}
