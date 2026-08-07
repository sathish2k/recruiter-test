"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import { useRef, useState } from "react";
import { IconRenderer } from "./icon-renderer";

export interface SplitButtonOption {
  /** Stable key the caller switches on. */
  value: string;
  label: string;
  icon?: string;
  /** Greyed with a lock glyph — the option exists but this user cannot use it. */
  locked?: boolean;
  /** Why it is locked. Shown under the label. */
  lockedReason?: string;
}

export interface SplitButtonProps {
  /** The action taken when the main half is pressed. */
  label: string;
  onClick: () => void;
  /** Its close relatives, offered behind the caret. */
  options: SplitButtonOption[];
  onSelect: (value: string) => void;
  variant?: "contained" | "outlined" | "soft";
  color?: "primary" | "secondary";
  size?: "small" | "medium" | "large";
  icon?: string;
  loading?: boolean;
  disabled?: boolean;
  /** Drops the label, leaving the glyph plus the caret — for a bulk-action bar. */
  iconOnly?: boolean;
}

/**
 * One default action plus its close relatives.
 *
 * For the case where a recruiter almost always wants the same thing — submit
 * to client — but occasionally needs a variant of it. The default stays one
 * click away; the variants cost a second click and never move the first one.
 */
export function SplitButton({
  label,
  onClick,
  options,
  onSelect,
  variant = "contained",
  color = "primary",
  size = "medium",
  icon,
  loading,
  disabled,
  iconOnly,
}: SplitButtonProps) {
  const [open, setOpen] = useState(false);
  const anchor = useRef<HTMLDivElement>(null);
  const blocked = disabled || loading;

  return (
    <>
      <Box
        ref={anchor}
        sx={{
          display: "inline-flex",
          // The seam between the halves is a divide, not two buttons — the
          // radii meet in the middle and the shared edge is drawn once.
          "& > button:first-of-type": {
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
          },
          "& > button:last-of-type": {
            borderTopLeftRadius: 0,
            borderBottomLeftRadius: 0,
            minWidth: 0,
            paddingInline: "8px",
            borderLeft: "1px solid",
            borderLeftColor: variant === "contained" ? "rgba(255,255,255,0.24)" : "surface.border",
          },
        }}
      >
        <Button
          variant={variant}
          color={color}
          size={size}
          onClick={onClick}
          disabled={blocked}
          startIcon={
            loading ? (
              <CircularProgress size={14} thickness={5} color="inherit" />
            ) : icon ? (
              <IconRenderer name={icon} size={17} />
            ) : undefined
          }
        >
          {iconOnly ? null : label}
        </Button>
        <Button
          variant={variant}
          color={color}
          size={size}
          onClick={() => setOpen((value) => !value)}
          disabled={blocked}
          aria-haspopup="menu"
          aria-expanded={open}
          aria-label={`${label} — more actions`}
        >
          <IconRenderer name="expand-more" size={18} />
        </Button>
      </Box>

      <Popper open={open} anchorEl={anchor.current} placement="bottom-end" sx={{ zIndex: 1301 }}>
        <ClickAwayListener onClickAway={() => setOpen(false)}>
          <Paper variant="dropdown" sx={{ mt: "6px", minWidth: 220 }}>
            {options.map((option) => (
              <MenuItem
                key={option.value}
                disabled={option.locked}
                onClick={() => {
                  setOpen(false);
                  onSelect(option.value);
                }}
                sx={{ alignItems: "flex-start" }}
              >
                {option.icon ? <IconRenderer name={option.icon} size={17} /> : null}
                <Box sx={{ minWidth: 0 }}>
                  <Box>{option.label}</Box>
                  {option.locked && option.lockedReason ? (
                    <Box sx={{ fontSize: 11.5, color: "text.disabled", mt: "1px" }}>
                      {option.lockedReason}
                    </Box>
                  ) : null}
                </Box>
                {option.locked ? (
                  <Box sx={{ ml: "auto", display: "flex", color: "text.disabled" }}>
                    <IconRenderer name="lock" size={15} />
                  </Box>
                ) : null}
              </MenuItem>
            ))}
          </Paper>
        </ClickAwayListener>
      </Popper>
    </>
  );
}
