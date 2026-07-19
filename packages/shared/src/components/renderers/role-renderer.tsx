"use client";

import Chip, { type ChipProps } from "@mui/material/Chip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useTranslation } from "@recruit/sdk";
import delve from "dlv";
import { type MouseEvent, useState } from "react";
import type { ActionHandler } from "./actions-renderer";
import { IconRenderer } from "./icon-renderer";

export interface RoleOption {
  value: string;
  /** Translation key. */
  label: string;
  color: ChipProps["color"];
}

export interface RoleRendererConfig {
  type: "role";
  /** Component id the option label keys resolve against. */
  id: string;
  /** Data path to the current role value. */
  path: string;
  /** actionHandler key emitted with the row plus the chosen `role`. */
  action: string;
  /** Menu heading translation key. */
  changeLabel?: string;
  options: RoleOption[];
}

export function RoleRenderer({
  config,
  data = {},
  actionHandler,
}: {
  config: RoleRendererConfig;
  data?: Record<string, unknown>;
  actionHandler?: ActionHandler;
}) {
  const { t } = useTranslation(config.id);
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);
  const current = String(delve(data, config.path) ?? "");
  const active = config.options.find((o) => o.value === current);

  const open = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchor(e.currentTarget);
  };
  const close = () => setAnchor(null);
  const choose = (value: string) => (e: MouseEvent) => {
    e.stopPropagation();
    close();
    if (value !== current)
      actionHandler?.[config.action]?.({ ...data, role: value });
  };

  return (
    <>
      <Chip
        variant="soft"
        size="small"
        color={active?.color ?? "default"}
        label={t(active?.label ?? current)}
        onClick={open}
        onDelete={open}
        deleteIcon={<IconRenderer name="unfold-more" size={13} />}
      />
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        onClick={(e) => e.stopPropagation()}
      >
        {config.changeLabel ? (
          <Typography
            variant="overline"
            sx={{ display: "block", px: "12px", pt: "4px" }}
          >
            {t(config.changeLabel)}
          </Typography>
        ) : null}
        {config.options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === current}
            onClick={choose(option.value)}
            sx={{ minWidth: 158, justifyContent: "space-between", gap: "10px" }}
          >
            {t(option.label)}
            {option.value === current ? (
              <IconRenderer name="check" size={14} color="#FF9D57" />
            ) : null}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
