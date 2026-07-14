"use client";

import Box from "@mui/material/Box";
import { usePortalRouter } from "@recruit/sdk";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";

/** Row action → callback. Keyed by the action's `type` (e.g. "addData"). */
export type ActionHandler = Record<
  string,
  (row: Record<string, unknown>) => void
>;

/**
 * A row action. `type: "link"` renders a LinkRenderer (spread the link config).
 * Any other `type` renders a circular icon-button that navigates (`routeId`) or
 * invokes `actionHandler[type]` with the row.
 */
export type ActionItem = {
  type?: string;
  /** Icon name for the icon-button variant. */
  icon?: string;
} & Partial<LinkRendererConfig>;

export interface ActionsRendererConfig {
  type: "actions";
  actions: ActionItem[];
}

// A row of actions. `type: "link"` items render through LinkRenderer; the rest
// render as circular icon-buttons (routeId nav or actionHandler[type](row)).
export function ActionsRenderer({
  config,
  data = {},
  actionHandler,
}: {
  config: ActionsRendererConfig;
  data?: Record<string, unknown>;
  actionHandler?: ActionHandler;
}) {
  const router = usePortalRouter();
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {config.actions.map((a, i) => {
        if (a.type === "link") {
          return (
            <LinkRenderer
              key={a.routeId ?? a.href ?? a.text ?? i}
              config={a}
              data={data}
            />
          );
        }
        return (
          <Box
            key={a.type ?? a.icon ?? i}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (a.routeId) router.push(a.routeId);
              else if (a.type) actionHandler?.[a.type]?.(data);
            }}
            sx={{
              width: 29,
              height: 29,
              borderRadius: "999px",
              border: "1px solid rgba(255,255,255,.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#C9C5BD",
              cursor: "pointer",
              "&:hover": { background: "rgba(255,255,255,.06)" },
            }}
          >
            {a.icon ? <IconRenderer name={a.icon} size={15} /> : null}
          </Box>
        );
      })}
    </Box>
  );
}
