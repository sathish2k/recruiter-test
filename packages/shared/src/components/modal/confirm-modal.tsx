"use client";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Dialog from "@mui/material/Dialog";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import { IconRenderer } from "../renderers/icon-renderer";
import { TONE_BG_VAR as TONE_BG, TONE_FG_VAR as TONE_FG } from "../renderers/tones";

/** Tone of the header tile, the points and the confirm button. */
export type ConfirmTone = "primary" | "success" | "warning" | "error" | "info";

/** One consequence of confirming: what happens, in its own tone. */
export interface ConfirmPoint {
  icon: string;
  tone?: ConfirmTone;
  text: string;
}

export interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  /** ICON_REGISTRY name for the header tile. */
  icon?: string;
  tone?: ConfirmTone;
  title: string;
  description?: string;
  /** The consequences of confirming, spelled out before it is. */
  points?: ConfirmPoint[];
  /**
   * Why the action cannot be taken. Present means the dialog explains and
   * offers only a way out — the confirm button is not rendered at all, so
   * there is nothing to click and no error to discover afterwards.
   */
  blockedReason?: string;
  confirmLabel: string;
  cancelLabel: string;
  /** Draws the confirm button in the error tone (deactivate, cancel invite). */
  danger?: boolean;
  busy?: boolean;
  width?: number | string;
}

/**
 * The design's consequence dialog: a toned glyph, a headline, and the list of
 * what confirming actually does — used wherever an action is reversible-ish
 * but worth reading first. A blocked action keeps the same shell and swaps the
 * points for the reason, so "why can't I?" is answered in place.
 */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  icon,
  tone = "primary",
  title,
  description,
  points = [],
  blockedReason,
  confirmLabel,
  cancelLabel,
  danger,
  busy,
  width = 520,
}: ConfirmModalProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: { background: "var(--mui-palette-surface-backdrop)", backdropFilter: "blur(4px)" },
        },
        paper: { sx: { width, maxWidth: "100%", m: 2, p: "22px 24px" } },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: "13px" }}>
        {icon ? (
          <Box
            sx={{
              width: 40,
              height: 40,
              flex: "none",
              borderRadius: "11px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: TONE_BG[tone],
              color: TONE_FG[tone],
            }}
          >
            <IconRenderer name={icon} size={20} color="inherit" />
          </Box>
        ) : null}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={{ fontSize: 17, fontWeight: 700, textWrap: "pretty" }}>
            {title}
          </Typography>
          {description ? (
            <Typography
              sx={{
                fontSize: 12.5,
                lineHeight: 1.65,
                color: "text.secondary",
                mt: "4px",
                textWrap: "pretty",
              }}
            >
              {description}
            </Typography>
          ) : null}
        </Box>
        <IconButton onClick={onClose} sx={{ width: 28, height: 28, flex: "none" }}>
          <IconRenderer name="close" size={14} />
        </IconButton>
      </Box>

      {blockedReason ? (
        <Card
          role="alert"
          variant="base"
          sx={{
            display: "flex",
            gap: "11px",
            p: "14px 16px",
            mt: "16px",
            boxShadow: "none",
            bgcolor: TONE_BG.error,
          }}
        >
          <Box sx={{ flex: "none", lineHeight: 1.3, color: TONE_FG.error }}>
            <IconRenderer name="block" size={18} color="inherit" />
          </Box>
          <Typography sx={{ fontSize: 12.5, lineHeight: 1.65, color: "text.secondary" }}>
            {blockedReason}
          </Typography>
        </Card>
      ) : (
        points.map((point) => (
          <Card
            key={point.text}
            variant="base"
            sx={{
              display: "flex",
              gap: "10px",
              p: "12px 14px",
              mt: "10px",
              boxShadow: "none",
              bgcolor: TONE_BG[point.tone ?? "primary"],
            }}
          >
            <Box sx={{ flex: "none", lineHeight: 1.35, color: TONE_FG[point.tone ?? "primary"] }}>
              <IconRenderer name={point.icon} size={17} color="inherit" />
            </Box>
            <Typography sx={{ fontSize: 12.5, lineHeight: 1.6, color: "text.secondary" }}>
              {point.text}
            </Typography>
          </Card>
        ))
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: "10px", mt: "20px" }}>
        <Button variant="outlined" onClick={onClose}>
          {cancelLabel}
        </Button>
        {blockedReason ? null : (
          <Button
            variant="contained"
            color={danger ? "error" : "primary"}
            disabled={busy}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        )}
      </Box>
    </Dialog>
  );
}
