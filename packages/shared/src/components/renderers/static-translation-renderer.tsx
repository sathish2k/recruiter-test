"use client";

import Typography, { type TypographyProps } from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import delve from "dlv";

export interface StaticTranslationRendererConfig {
  type: "static-translation";
  /** Component id whose translation the key resolves against — the engine keys
   * every bundle by component id, so this is the owning `*.Component`. */
  id: string;
  /** Translation key. The resolved string may contain a `{value}` placeholder. */
  key?: string;
  /** Read the key from the row instead — `keyPrefix + data[keyPath]`. Lets one
   * config label rows whose copy differs per record. */
  keyPath?: string;
  keyPrefix?: string;
  /** Path into data for the dynamic value combined with the translation. */
  value?: string;
  variant?: TypographyProps["variant"];
  color?: TypographyProps["color"];
  sx?: TypographyProps["sx"];
}

export function StaticTranslationRenderer({
  config,
  data = {},
}: {
  config: StaticTranslationRendererConfig;
  data?: Record<string, unknown>;
}) {
  const { t } = useTranslation(config.id);
  const fromRow = config.keyPath ? String(delve(data, config.keyPath) ?? "") : "";
  const resolvedKey = fromRow ? `${config.keyPrefix ?? ""}${fromRow}` : (config.key ?? "");
  const template = resolvedKey ? t(resolvedKey) : "";
  const dynamic = config.value != null ? delve(data, config.value) : undefined;
  const text =
    dynamic == null
      ? template
      : template.includes("{value}")
        ? template.replace(/\{value\}/g, String(dynamic))
        : `${template} ${dynamic}`;

  return (
    <Typography component="span" variant={config.variant} color={config.color} sx={config.sx}>
      {text}
    </Typography>
  );
}
