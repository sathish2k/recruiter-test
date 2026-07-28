"use client";

import Box from "@mui/material/Box";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { ListRenderer, type ListRendererConfig } from "../list/list-renderer";
import { TableRenderer, type TableRendererConfig } from "../table-renderer";
import { SlidingPillTabs } from "../tabs/sliding-pill-tabs";

/**
 * One tab of a detail screen's workspace panel. `table` draws a grid, `list`
 * draws the rows shape (a timeline, notes) — both read the same datasource,
 * which receives the active tab as a filter.
 */
export type WorkspaceTabConfig = {
  value: string;
  label: { name: string };
  title: { name: string };
  /** Route the tab`s "view all" link points at. */
  viewAllRouteId?: string;
} & ({ table: TableRendererConfig; list?: never } | { list: ListRendererConfig; table?: never });

/**
 * The design's pill-tabbed panel. The tab travels to the datasource as a
 * filter, so switching re-queries that one list rather than loading every tab
 * up front — one component and one endpoint per detail screen.
 */
export function TabbedWorkspaceRenderer({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<WorkspaceTabConfig[]>(id);
  const params = useRouteParams();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState("");

  const active = config?.find((entry) => entry.value === tab) ?? config?.[0];
  // A list tab's own filter chips write a search param; this panel owns the
  // request, so it has to carry that param too or the chips would do nothing.
  const filterParam = active?.list?.filterParam;
  const filterValue = filterParam ? searchParams.get(filterParam) : null;
  const { data, isLoading } = useFetch<Record<string, unknown>[]>(id, {
    filters: {
      ...params,
      tab: active?.value,
      ...(filterParam && filterValue ? { [filterParam]: filterValue } : {}),
    },
  });

  if (!config?.length || !active) return null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <SlidingPillTabs
        items={config.map((entry) => ({
          value: entry.value,
          render: () => t(entry.label.name),
        }))}
        value={active.value}
        onChange={setTab}
        sx={{ alignSelf: "flex-start" }}
      />
      {active.list ? (
        <ListRenderer
          id={id}
          config={{ ...active.list, title: active.title }}
          data={data ?? []}
          isLoading={isLoading}
        />
      ) : (
        <TableRenderer
          id={id}
          config={{ ...active.table, header: { title: active.title.name } }}
          data={data ?? []}
          isLoading={isLoading}
        />
      )}
    </Box>
  );
}
