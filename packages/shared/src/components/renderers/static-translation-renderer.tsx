"use client";

import Typography, { type TypographyProps } from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import delve from "dlv";

export interface StaticTranslationRendererConfig {
  type: "static-translation";
  /** Component id whose translation the key resolves against — the engine keys
   * every bundle by component id, so this is the owning `*.Component`. */
  id: string;
  /** Translation key. The resolved string may contain a `{value}` placeholder
   * for `value`'s path, plus i18next `{{token}}`s read from the row. */
  key?: string;
  /** Read the key from the row instead — `keyPrefix + data[keyPath]`. Lets one
   * config label rows whose copy differs per record. */
  keyPath?: string;
  keyPrefix?: string;
  /** Path into data for the dynamic value combined with the translation. */
  value?: string;
  variant?: TypographyProps["variant"];
  color?: TypographyProps["color"];
  /** Colour per `keyPath` value — the SLA cell, where the same sentence reads
   * green on track and red overdue. */
  colors?: Record<string, TypographyProps["color"]>;
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
  // The row is interpolated too (i18next `{{token}}`), as stat-card subs are,
  // so a sentence can name a second figure alongside `{value}`.
  const template = resolvedKey ? t(resolvedKey, data) : "";
  const dynamic = config.value != null ? delve(data, config.value) : undefined;
  // A `keyPath` config serves several sentences at once and some of them do not
  // take the figure ("No target"), so an unreferenced value is dropped rather
  // than appended — appending is only the fallback for a single literal key.
  const text =
    dynamic == null
      ? template
      : template.includes("{value}")
        ? template.replace(/\{value\}/g, String(dynamic))
        : fromRow
          ? template
          : `${template} ${dynamic}`;

  const color = (fromRow && config.colors?.[fromRow]) || config.color;

  return (
    <Typography component="span" variant={config.variant} color={color} sx={config.sx}>
      {text}
    </Typography>
  );
}
