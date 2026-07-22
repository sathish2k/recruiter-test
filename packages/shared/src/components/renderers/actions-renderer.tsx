"use client";

import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { type AccessRule, usePortalRouter } from "@recruit/sdk";
import { IconRenderer } from "./icon-renderer";
import { LinkRenderer, type LinkRendererConfig } from "./link-renderer";

/** Row action → callback. Keyed by the action's `type` (e.g. "addData"). */
export type ActionHandler = Record<string, (row: Record<string, unknown>) => void>;

/**
 * A row action. `type: "link"` renders a LinkRenderer (spread the link config).
 * Any other `type` renders a circular icon-button that navigates (`routeId`) or
 * invokes `actionHandler[type]` with the row.
 */
export type ActionItem = {
  type?: string;
  /** Icon name for the icon-button variant. */
  icon?: string;
  /** Access rule verified + stripped by the engine before render. */
  access?: AccessRule;
  /** Boolean data path; the action is hidden on rows where it's truthy. */
  hideWhen?: string;
} & Partial<LinkRendererConfig>;

export interface ActionsRendererConfig {
  type: "actions";
  actions: ActionItem[];
}

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
          return <LinkRenderer key={a.routeId ?? a.href ?? a.text ?? i} config={a} data={data} />;
        }
        return (
          <IconButton
            key={a.type ?? a.icon ?? i}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              if (a.routeId) router.push(a.routeId);
              else if (a.type) actionHandler?.[a.type]?.(data);
            }}
          >
            {a.icon ? <IconRenderer name={a.icon} size={15} /> : null}
          </IconButton>
        );
      })}
    </Box>
  );
}
