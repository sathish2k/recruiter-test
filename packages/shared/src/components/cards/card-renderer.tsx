"use client";

import Card from "@mui/material/Card";
import { useConfiguration, useFetch, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { seedRecord } from "../../utils/seed-data";
import type { ActionHandler } from "../renderers/actions-renderer";
import { LinkRenderer } from "../renderers/link-renderer";
import { CardBodyRenderer } from "./card-body-renderer";
import { CardFooterRenderer } from "./card-footer-renderer";
import { CardHeaderRenderer } from "./card-header-renderer";
import type { CardRendererConfig, T } from "./card-renderer.types";

/**
 * Config-driven feature card: a themed `Card` shell around a header, a list of
 * body blocks and a footer, each its own renderer. Every card in the design is
 * a config over these three — there are no per-card components.
 *
 * Bind it straight to a bootstrap `value` with a `.configuration.ts` +
 * `.datasource.ts`; it resolves both by id.
 */
export function CardRenderer({
  id,
  config: configProp,
  data: dataProp,
  actionHandler,
}: {
  id: string;
  config?: CardRendererConfig;
  data?: Record<string, unknown>;
  actionHandler?: ActionHandler;
}) {
  const configFromId = useConfiguration<CardRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { t } = useTranslation(id) as { t: T };
  const { data: resolved, isLoading } = useFetch<Record<string, unknown>>(id, {
    data: seedRecord(dataProp),
  });
  const data = resolved ?? {};

  if (!config) return null;
  if (!isLoading && config.showPath) {
    const gate = delve(data, config.showPath);
    if (!gate || gate === "0") return null;
  }

  // Fill the row: side-by-side cards (SLA + AI recommendation) sit in stretched
  // grid items, so the card and its link wrapper both need the full height or
  // each stops at its own content and the pair ends up ragged.
  const card = (
    <Card
      variant={config.variant ?? "base"}
      sx={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {config.header ? (
        <CardHeaderRenderer config={config.header} data={data} t={t} isLoading={isLoading} />
      ) : null}
      {config.body ? (
        <CardBodyRenderer
          rows={config.body}
          data={data}
          actionHandler={actionHandler}
          isLoading={isLoading}
        />
      ) : null}
      {config.footer ? (
        <CardFooterRenderer
          config={config.footer}
          data={data}
          t={t}
          actionHandler={actionHandler}
          isLoading={isLoading}
          insideLink={Boolean(config.link)}
        />
      ) : null}
    </Card>
  );

  if (!config.link || isLoading) return card;
  return (
    <LinkRenderer
      config={{ ...config.link, sx: { display: "block", height: "100%", ...config.link.sx } }}
    >
      {card}
    </LinkRenderer>
  );
}
