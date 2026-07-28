"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { useSearchParams } from "next/navigation";
import { seedRows } from "../../utils/seed-data";
import {
  SegmentedFilterRenderer,
  type SegmentedFilterRendererConfig,
} from "../filters/segmented-filter-renderer";
import type { ActionHandler } from "../renderers/actions-renderer";
import { GenericRenderer, type GenericRendererConfig } from "../renderers/generic-renderer";
import { IconRenderer } from "../renderers/icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "../renderers/link-renderer";
import { ListSection, type ListSectionItem, type ListTitleScale, type ListVariant } from "./list";

/** Every slot of a row is a GenericRenderer config — same value vocabulary as
 * tables and cards. The list owns only the row shape. */
export interface ListRowConfig {
  /** Data path for the React key. */
  keyPath: string;
  /** Leading dot / avatar tile. */
  leading?: GenericRendererConfig;
  title: GenericRendererConfig;
  description?: GenericRendererConfig;
  /** Inline badge after the title (a status pill). */
  chips?: GenericRendererConfig;
  /** Right-hand pill (the interview time). */
  trailing?: GenericRendererConfig;
  /** Right-hand control (an icon button). */
  action?: GenericRendererConfig;
  /** Makes the whole row a link. */
  link?: LinkRendererConfig;
}

export interface ListRendererConfig {
  /** Card title. Translation key. */
  title?: { name: string };
  /** Muted count beside the title. Translation key, interpolated with `{{count}}`. */
  badge?: { name: string };
  /** Circular icon link on the right of the header. */
  headerLink?: { icon: string; link: LinkRendererConfig };
  /** Text link on the right of the header ("View all"). */
  headerTextLink?: { label: { name: string }; link: LinkRendererConfig };
  variant?: ListVariant;
  /** Which of the design`s card-title scales to draw the title at. */
  titleScale?: ListTitleScale;
  /** ICON_REGISTRY name drawn accent-coloured before the title. */
  icon?: string;
  /** Row path to group consecutive rows under an uppercase heading, plus the
   * translation prefix for those headings — the design`s TODAY / YESTERDAY. */
  groupPath?: string;
  groupLabelPrefix?: string;
  /** Chips above the rows that filter the list, written to the URL and read
   * back through `filterParam`. */
  filters?: SegmentedFilterRendererConfig;
  dense?: boolean;
  divided?: boolean;
  /** Space under the header (design: 8px priorities, 12px activity, 14px upcoming). */
  headerGap?: string;
  row: ListRowConfig;
  /** Full-width outlined button under the rows ("View All"). */
  footerLink?: { label: { name: string }; link: LinkRendererConfig };
  /** Read this search-param into the datasource filters, so a sibling
   * SegmentedFilterRenderer writing the same param re-queries this list. */
  filterParam?: string;
  /** Shown in place of rows when the list comes back empty. Translation key. */
  emptyText?: { name: string };
  skeletonRows?: number;
}

type Row = Record<string, unknown>;

export function ListRenderer({
  id,
  config: configProp,
  data: dataProp,
  actionHandler,
  isLoading: loadingProp,
}: {
  id: string;
  config?: ListRendererConfig;
  data?: Row[];
  actionHandler?: ActionHandler;
  /** Set by an owner that fetched the rows itself (a tabbed panel), so the
   * skeleton follows that request rather than this list's seeded data. */
  isLoading?: boolean;
}) {
  const configFromId = useConfiguration<ListRendererConfig>(id);
  const config = configProp ?? configFromId;
  const { t } = useTranslation(id);
  const searchParams = useSearchParams();
  const routeParams = useRouteParams();
  const param = config?.filterParam;
  const paramValue = param ? searchParams.get(param) : null;
  const { data, isLoading: fetching } = useFetch<Row[]>(id, {
    data: seedRows<Row>(dataProp),
    filters: { ...routeParams, ...(param && paramValue ? { [param]: paramValue } : {}) },
  });
  const isLoading = loadingProp ?? fetching;
  const rows = Array.isArray(data) ? data : [];

  if (!config) return null;

  const slot = (value: GenericRendererConfig | undefined, row: Row) =>
    value ? (
      <GenericRenderer config={value} data={row} actionHandler={actionHandler} id={id} />
    ) : undefined;

  const items: ListSectionItem[] = rows.map((row, index) => ({
    key: String(delve(row, config.row.keyPath) ?? index),
    icon: slot(config.row.leading, row),
    title: slot(config.row.title, row),
    description: slot(config.row.description, row),
    chips: slot(config.row.chips, row),
    trailing: slot(config.row.trailing, row),
    action: slot(config.row.action, row),
    wrap: config.row.link
      ? (node) => (
          <LinkRenderer
            config={{ ...config.row.link, sx: { display: "block", ...config.row.link?.sx } }}
            data={row}
          >
            {node}
          </LinkRenderer>
        )
      : undefined,
  }));

  // Insert a heading row whenever the group value changes.
  const grouped = config.groupPath
    ? items.flatMap((item, index) => {
        const group = String(delve(rows[index] ?? {}, config.groupPath ?? "") ?? "");
        const previous =
          index === 0 ? null : String(delve(rows[index - 1] ?? {}, config.groupPath ?? "") ?? "");
        if (group === previous) return [item];
        return [
          {
            key: `group-${group}-${index}`,
            title: null,
            groupLabel: t(`${config.groupLabelPrefix ?? ""}${group}`),
          },
          item,
        ];
      })
    : items;

  return (
    <ListSection
      title={config.title ? t(config.title.name) : undefined}
      badge={
        config.badge && !isLoading ? (
          <Box component="span" sx={{ fontSize: 11.5, color: "text.disabled" }}>
            {t(config.badge.name, { count: rows.length })}
          </Box>
        ) : undefined
      }
      headerAction={<HeaderAction config={config} t={t} />}
      beforeItems={
        config.filters ? <SegmentedFilterRenderer id={id} config={config.filters} /> : undefined
      }
      variant={config.variant}
      dense={config.dense}
      headerGap={config.headerGap}
      titleScale={config.titleScale}
      icon={
        config.icon ? (
          <Box sx={{ display: "flex", color: "surface.accentBright" }}>
            <IconRenderer name={config.icon} size={17} />
          </Box>
        ) : undefined
      }
      divided={config.divided ?? config.variant === "divided"}
      items={grouped}
      isLoading={isLoading}
      skeletonRows={config.skeletonRows ?? 3}
      skeletonShape={{ icon: Boolean(config.row.leading), action: "none" }}
      footer={
        config.footerLink ? (
          <ListFooterLink label={t(config.footerLink.label.name)} link={config.footerLink.link} />
        ) : !isLoading && rows.length === 0 && config.emptyText ? (
          <Box sx={{ textAlign: "center", py: "6px" }}>{t(config.emptyText.name)}</Box>
        ) : undefined
      }
    />
  );
}

function HeaderAction({ config, t }: { config: ListRendererConfig; t: (key: string) => string }) {
  if (config.headerLink) {
    return (
      <LinkRenderer config={config.headerLink.link}>
        <Box
          sx={{
            width: 28,
            height: 28,
            borderRadius: "999px",
            border: "1px solid",
            borderColor: "surface.borderStrong",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "surface.textMuted",
            "&:hover": { bgcolor: "action.hover" },
          }}
        >
          <IconRenderer name={config.headerLink.icon} size={14} color="inherit" />
        </Box>
      </LinkRenderer>
    );
  }
  if (config.headerTextLink) {
    return (
      <LinkRenderer config={config.headerTextLink.link}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: 12,
            fontWeight: 600,
            color: "surface.primarySoftFg",
          }}
        >
          {t(config.headerTextLink.label.name)}
          <IconRenderer name="arrow-forward" size={13} />
        </Box>
      </LinkRenderer>
    );
  }
  return undefined;
}

/** Rendered by the list only when `footerLink` is set — a full-width outlined
 * pill under the rows, as the design's "View All". */
export function ListFooterLink({ label, link }: { label: string; link: LinkRendererConfig }) {
  return (
    <LinkRenderer config={{ ...link, sx: { display: "block", ...link.sx } }}>
      <Button variant="outlined" fullWidth sx={{ fontSize: 13, p: "11px", borderRadius: "12px" }}>
        {label}
      </Button>
    </LinkRenderer>
  );
}
