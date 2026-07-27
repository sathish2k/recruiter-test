"use client";

import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Skeleton from "@mui/material/Skeleton";
import type { ActionHandler } from "../renderers/actions-renderer";
import { GenericRenderer } from "../renderers/generic-renderer";
import { IconRenderer } from "../renderers/icon-renderer";
import type { CardBodyRow } from "./card-renderer.types";

export function CardBodyRenderer({
  rows,
  data,
  actionHandler,
  isLoading,
}: {
  rows: CardBodyRow[];
  data: Record<string, unknown>;
  actionHandler?: ActionHandler;
  isLoading?: boolean;
}) {
  return (
    <>
      {rows.map((row, index) => {
        // biome-ignore lint/suspicious/noArrayIndexKey: rows are a fixed config list
        const key = index;
        if (row.divider) return <Divider key={key} sx={{ m: "2px 0 13px", ...row.sx }} />;
        if (isLoading) return <CardBodyRowSkeleton key={key} row={row} />;
        return (
          <Box
            key={key}
            sx={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0, ...row.sx }}
          >
            {row.icon ? <IconRenderer {...row.icon} data={data} /> : null}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <GenericRenderer config={row.value} data={data} actionHandler={actionHandler} />
            </Box>
          </Box>
        );
      })}
    </>
  );
}

/** Mirrors the row's own shape, so the card doesn't resize when data lands. */
function CardBodyRowSkeleton({ row }: { row: Extract<CardBodyRow, { value: unknown }> }) {
  if (row.value.type === "entity") {
    const size = row.value.size ?? 34;
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: "11px", ...row.sx }}>
        <Skeleton variant="circular" width={size} height={size} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="55%" height={20} />
          {row.value.subtitle ? (
            <Skeleton variant="text" width="70%" height={16} sx={{ mt: "3px" }} />
          ) : null}
        </Box>
      </Box>
    );
  }
  if (row.value.type === "ai-match" || row.value.type === "pill") {
    return (
      <Box sx={{ display: "flex", alignItems: "center", gap: "7px", ...row.sx }}>
        <Skeleton variant="rounded" width={48} height={20} sx={{ borderRadius: "999px" }} />
        <Skeleton variant="text" width={90} height={15} />
      </Box>
    );
  }
  return <Skeleton variant="text" width="80%" height={20} sx={row.sx} />;
}
