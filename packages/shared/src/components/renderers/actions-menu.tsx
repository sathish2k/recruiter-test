"use client";

import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { usePortalRouter, useTranslation } from "@recruit/sdk";
import { type MouseEvent, useState } from "react";
import type { ActionHandler, ActionItem } from "./actions-renderer";
import { IconRenderer } from "./icon-renderer";

export interface MenuRendererConfig {
  type: "menu";
  /** Menu items. Each supports a link (routeId/href) or a custom actionHandler. */
  actions: ActionItem[];
  /** Component id the item `label.name` keys resolve against. */
  id?: string;
}

// A kebab (⋮) trigger that opens a dropdown of row actions. Each item resolves
// its label (translation key `label.name`, or literal `text`) and its icon, and
// on click either navigates (`type: "link"` / `routeId` / external `href`) or
// invokes `actionHandler[type](row)` — the same contract as ActionsRenderer.
export function ActionsMenu({
  id,
  actions,
  data = {},
  actionHandler,
}: {
  id?: string;
  actions: ActionItem[];
  data?: Record<string, unknown>;
  actionHandler?: ActionHandler;
}) {
  const router = usePortalRouter();
  const { t } = useTranslation(id ?? "");
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const open = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchor(e.currentTarget);
  };
  const close = () => setAnchor(null);

  const handle = (a: ActionItem) => (e: MouseEvent) => {
    e.stopPropagation();
    close();
    if (a.type === "link" || a.routeId || a.href) {
      if (a.routeId) router.push(a.routeId);
      else if (a.href) window.open(a.href, a.target ?? "_self");
    } else if (a.type) {
      actionHandler?.[a.type]?.(data);
    }
  };

  const labelOf = (a: ActionItem) =>
    (a.label ? t(a.label.name) : a.text) ?? a.type ?? "";

  if (!actions.length) return null;

  return (
    <>
      <IconButton
        size="small"
        onClick={open}
        aria-label="actions"
        sx={{
          width: 29,
          height: 29,
          border: "1px solid rgba(255,255,255,.12)",
          color: "#C9C5BD",
          "&:hover": { background: "rgba(255,255,255,.06)" },
        }}
      >
        <IconRenderer name="more-vert" size={17} />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {actions.map((a, i) => (
          <MenuItem
            key={a.type ?? a.routeId ?? a.href ?? i}
            onClick={handle(a)}
            sx={{ fontSize: 13, gap: "8px" }}
          >
            {a.icon ? (
              <ListItemIcon sx={{ minWidth: "0 !important" }}>
                <IconRenderer name={a.icon} size={16} color="#C9C5BD" />
              </ListItemIcon>
            ) : null}
            {labelOf(a)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
