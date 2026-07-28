"use client";

import Box from "@mui/material/Box";
import { useConfiguration, useFetch, useRouteParams, useTranslation } from "@recruit/sdk";
import { SlidingPillTabs, TableRenderer } from "@recruit/shared";
import { useState } from "react";
import type { WorkspaceTabConfig } from "./client-detail-workspace.configuration";

/**
 * The client's workspace: one pill-tab per list. The tab travels to the
 * datasource as a filter, so switching re-queries that list instead of loading
 * every one of them up front.
 */
export function ClientDetailWorkspaceComponent({ id }: { id: string }) {
  const { t } = useTranslation(id);
  const config = useConfiguration<WorkspaceTabConfig[]>(id);
  const params = useRouteParams();
  const [tab, setTab] = useState("");

  const active = config?.find((entry) => entry.value === tab) ?? config?.[0];
  const { data, isLoading } = useFetch<Record<string, unknown>[]>(id, {
    filters: { id: params.id, tab: active?.value },
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
      <TableRenderer
        id={id}
        config={{ ...active.table, header: { title: active.title.name } }}
        data={data ?? []}
        isLoading={isLoading}
      />
    </Box>
  );
}
