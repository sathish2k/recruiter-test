"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { IconRenderer } from "../renderers/icon-renderer";
import { TONE_BG, TONE_FG } from "../renderers/tones";

/** The four tones an auth surface uses to colour a state tile or a panel. */
export type AuthTone = "primary" | "success" | "warning" | "error";

export function authToneFg(tone: AuthTone): string {
  return TONE_FG[tone];
}

/**
 * The 44px tinted tile above a state screen's title — "email verified",
 * "link expired", "password updated". The tone is the state, not decoration.
 */
export function AuthStateTile({ icon, tone = "primary" }: { icon: string; tone?: AuthTone }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        width: 44,
        height: 44,
        borderRadius: "8px",
        bgcolor: TONE_BG[tone],
        color: TONE_FG[tone],
        mb: "18px",
      }}
    >
      <IconRenderer name={icon} size={22} color="inherit" />
    </Box>
  );
}

/**
 * The inset explanatory panel that closes most auth screens — an icon beside a
 * sentence saying what is and isn't affected. `tone` tints it when the note
 * carries a state (a Caps Lock warning); left unset it is a neutral well.
 */
export function AuthNote({
  icon,
  tone,
  children,
}: {
  icon: string;
  tone?: AuthTone;
  children: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "flex-start",
        gap: "11px",
        p: "14px 16px",
        borderRadius: "8px",
        bgcolor: tone ? TONE_BG[tone] : "surface.inset",
        fontSize: 12,
        lineHeight: 1.65,
        color: tone ? TONE_FG[tone] : "text.secondary",
      }}
    >
      <Box sx={{ flex: "none", lineHeight: 1.2, color: "inherit" }}>
        <IconRenderer name={icon} size={19} color="inherit" />
      </Box>
      <Box sx={{ minWidth: 0 }}>{children}</Box>
    </Box>
  );
}

/**
 * The "resend · | · use a different email" row. Items are rendered in order
 * with a hairline rule between them, so a screen adds or drops one without
 * restating the separator.
 */
export function AuthActionRow({ children }: { children: ReactNode[] }) {
  const items = children.filter(Boolean);
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: "14px", mt: "18px", fontSize: 13 }}>
      {items.map((item, index) => (
        // Positional separators between caller-supplied nodes.
        // biome-ignore lint/suspicious/noArrayIndexKey: order is the identity
        <Box key={index} sx={{ display: "contents" }}>
          {index > 0 ? <Box sx={{ width: "1px", height: 13, bgcolor: "surface.divider" }} /> : null}
          {item}
        </Box>
      ))}
    </Box>
  );
}

/** A borderless text action inside `AuthActionRow`. */
export function AuthTextAction({
  label,
  onClick,
  disabled,
}: {
  label: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        border: "none",
        background: "none",
        p: 0,
        font: "inherit",
        fontWeight: 600,
        color: "text.secondary",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.6 : 1,
        "&:hover": { color: disabled ? "text.secondary" : "text.primary" },
      }}
    >
      {label}
    </Box>
  );
}

/**
 * The dashed key/value rows a state screen uses to say exactly what happened —
 * which account, how many sessions ended, where it was logged.
 */
export function AuthSummary({
  rows,
}: {
  rows: { label: ReactNode; value: ReactNode; tone?: AuthTone }[];
}) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", mt: "22px", fontSize: 12.5 }}>
      {rows.map((row, index) => (
        <Box
          // Rows are identified by their label within one screen.
          key={String(row.label)}
          sx={{
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            p: "11px 0",
            ...(index === rows.length - 1
              ? {}
              : { borderBottom: "1px dashed", borderColor: "surface.divider" }),
          }}
        >
          <Typography component="span" sx={{ fontSize: 12.5, color: "text.secondary" }}>
            {row.label}
          </Typography>
          <Typography
            component="b"
            sx={{
              fontSize: 12.5,
              fontWeight: 700,
              color: row.tone ? TONE_FG[row.tone] : "surface.textMuted",
            }}
          >
            {row.value}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
