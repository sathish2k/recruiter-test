"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import { type AccessRule, usePortalRouter, useTranslation } from "@recruit/sdk";
import delve from "dlv";
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
  /** Draw this action as an accent pill rather than a bare icon or text link —
   * the design`s row-level call to action. */
  button?: boolean;
} & Partial<LinkRendererConfig>;

export interface ActionsRendererConfig {
  type: "actions";
  actions: ActionItem[];
}

export function ActionsRenderer({
  config,
  data = {},
  actionHandler,
  id = "",
}: {
  config: ActionsRendererConfig;
  data?: Record<string, unknown>;
  actionHandler?: ActionHandler;
  /** Component id, so a button action can resolve its label. */
  id?: string;
}) {
  const router = usePortalRouter();
  const { t } = useTranslation(id);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "6px" }}>
      {config.actions.map((a, i) => {
        // Declared but previously unenforced: an action can opt out per row.
        if (a.hideWhen && delve(data, a.hideWhen)) return null;
        if (a.button) {
          const label = a.label ? t(a.label.name) : a.text;
          return (
            <LinkRenderer
              key={a.routeId ?? a.text ?? i}
              config={{ ...a, label: undefined }}
              data={data}
            >
              <Button
                variant="soft"
                startIcon={a.icon ? <IconRenderer name={a.icon} size={14} /> : undefined}
              >
                {label}
              </Button>
            </LinkRenderer>
          );
        }
        if (a.type === "link") {
          return <LinkRenderer key={a.routeId ?? a.href ?? a.text ?? i} config={a} data={data} />;
        }
        // `href` with {token}s resolved from the row — the design`s mail/call
        // buttons beside a contact.
        let missing = false;
        const href = a.href?.replace(/\{(\w+)\}/g, (_, key) => {
          const value = String(delve(data, key) ?? "");
          if (!value) missing = true;
          return value;
        });
        // A mailto/tel with nothing to dial is worse than no button at all.
        if (href && missing) return null;
        if (href) {
          return (
            <IconButton
              key={a.icon ?? i}
              component="a"
              href={href}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              {a.icon ? <IconRenderer name={a.icon} size={15} /> : null}
            </IconButton>
          );
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
