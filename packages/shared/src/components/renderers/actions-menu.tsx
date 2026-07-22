"use client";

import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { usePortalRouter, useTranslation } from "@recruit/sdk";
import delve from "dlv";
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

  const resolveParams = (a: ActionItem) =>
    Object.fromEntries(
      Object.entries(a.params ?? {}).map(([key, param]) => [
        key,
        String(
          (param.type === "dynamic" && param.path ? delve(data, param.path) : param.value) ?? "",
        ),
      ]),
    );

  const handle = (a: ActionItem) => (e: MouseEvent) => {
    e.stopPropagation();
    close();
    if (a.type === "link" || a.routeId || a.href) {
      if (a.routeId) router.push(a.routeId, resolveParams(a));
      else if (a.href) window.open(a.href, a.target ?? "_self");
    } else if (a.type) {
      actionHandler?.[a.type]?.(data);
    }
  };

  const labelOf = (a: ActionItem) => (a.label ? t(a.label.name) : a.text) ?? a.type ?? "";

  // A row can opt out of individual actions — e.g. the owner, who can't be
  // suspended, removed or re-invited.
  const visible = actions.filter((a) => !a.hideWhen || !delve(data, a.hideWhen));

  if (!visible.length) return null;

  return (
    <>
      <IconButton onClick={open} aria-label="actions">
        <IconRenderer name="more" size={15} />
      </IconButton>
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        onClick={(e) => e.stopPropagation()}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {visible.map((a, i) => (
          <MenuItem key={a.type ?? a.routeId ?? a.href ?? i} onClick={handle(a)}>
            {a.icon ? (
              <ListItemIcon sx={{ minWidth: "0 !important" }}>
                <IconRenderer name={a.icon} size={16} />
              </ListItemIcon>
            ) : null}
            {labelOf(a)}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
