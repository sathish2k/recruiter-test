"use client";

import Box from "@mui/material/Box";
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
  /** Boolean data path; truthy rows render a locked, non-clickable chip. */
  lockedPath?: string;
  /** Role values that can never be assigned from this menu. */
  lockedValues?: string[];
  /** Tooltip shown on a locked chip. */
  lockedHint?: string;
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
  // The owner's role isn't reassignable from this table — the chip reads as a
  // locked badge, and the owner never appears as a choice for anyone else.
  const locked = !!config.lockedPath && !!delve(data, config.lockedPath);
  const options = config.options.filter((o) => !config.lockedValues?.includes(o.value));

  const open = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();
    setAnchor(e.currentTarget);
  };
  const close = () => setAnchor(null);
  const choose = (value: string) => (e: MouseEvent) => {
    e.stopPropagation();
    close();
    if (value !== current) actionHandler?.[config.action]?.({ ...data, role: value });
  };

  return (
    <>
      <Chip
        variant="soft"
        size="small"
        color={active?.color ?? "default"}
        label={
          locked ? (
            // MUI's `icon` slot always precedes the label; the design puts the
            // lock after the text, so it lives inside the label instead.
            <Box component="span" sx={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
              {t(active?.label ?? current)}
              <IconRenderer name="lock" size={12} />
            </Box>
          ) : (
            t(active?.label ?? current)
          )
        }
        title={locked ? t(config.lockedHint ?? "") : undefined}
        onClick={locked ? undefined : open}
        onDelete={locked ? undefined : open}
        deleteIcon={locked ? undefined : <IconRenderer name="unfold-more" size={13} />}
        sx={{
          height: "auto",
          py: "5px",
          px: "12px",
          "& .MuiChip-label": { px: 0 },
          "& .MuiChip-deleteIcon": { m: 0, ml: "6px" },
          ...(locked ? { cursor: "default" } : {}),
        }}
      />
      <Menu
        anchorEl={anchor}
        open={Boolean(anchor)}
        onClose={close}
        onClick={(e) => e.stopPropagation()}
      >
        {config.changeLabel ? (
          <Typography variant="overline" sx={{ display: "block", px: "12px", pt: "4px" }}>
            {t(config.changeLabel)}
          </Typography>
        ) : null}
        {options.map((option) => (
          <MenuItem
            key={option.value}
            selected={option.value === current}
            onClick={choose(option.value)}
            sx={{ minWidth: 158, justifyContent: "space-between", gap: "10px" }}
          >
            {t(option.label)}
            {option.value === current ? (
              <IconRenderer
                name="check"
                size={14}
                color="var(--mui-palette-surface-accentBright)"
              />
            ) : null}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}
