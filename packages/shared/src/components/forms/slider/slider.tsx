"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { WidgetProps } from "../types";

export interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  /** Appended to the value readout, e.g. "%". */
  suffix?: string;
  /** Shown on the label row (left); the value sits on the right. */
  label?: string;
  /** Small captions under the track ends, e.g. "50 · broad" / "95 · strict". */
  minLabel?: string;
  maxLabel?: string;
  disabled?: boolean;
}

const STEP_BTN = {
  width: 26,
  height: 26,
  flex: "none",
  borderRadius: "999px",
  border: "1px solid",
  borderColor: "surface.border",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: 15,
  cursor: "pointer",
  userSelect: "none",
  "&:hover": { bgcolor: "action.hover" },
} as const;

/**
 * A themed range control — `−`/`+` steppers around a gradient track with a
 * draggable thumb, the current value (with optional `suffix`) on the label row,
 * and optional `broad`/`strict` end captions. Controlled; used both directly
 * (e.g. the AI screening card) and as the config-driven `slider` widget.
 */
export function Slider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  suffix,
  label,
  minLabel,
  maxLabel,
  disabled,
}: SliderProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v));
  const snap = (v: number) => clamp(Math.round(v / step) * step);
  const val = clamp(Number.isFinite(value) ? value : min);
  const markerLeft = `${((val - min) / (max - min || 1)) * 100}%`;

  const set = (v: number) => {
    if (!disabled) onChange(snap(v));
  };
  const seek = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (disabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width) return;
    set(min + ((e.clientX - rect.left) / rect.width) * (max - min));
  };

  return (
    <Box sx={{ opacity: disabled ? 0.6 : 1 }}>
      {label || suffix !== undefined ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "baseline",
            justifyContent: "space-between",
            mb: "10px",
          }}
        >
          {label ? (
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>{label}</Typography>
          ) : (
            <span />
          )}
          <Typography sx={{ fontSize: 19, fontWeight: 700, color: "surface.accentBright" }}>
            {val}
            {suffix}
          </Typography>
        </Box>
      ) : null}
      <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <Box sx={STEP_BTN} onClick={() => set(val - step)}>
          −
        </Box>
        <Box
          onPointerDown={seek}
          sx={{
            flex: 1,
            position: "relative",
            height: 22,
            display: "flex",
            alignItems: "center",
            cursor: disabled ? "default" : "pointer",
          }}
        >
          <Box
            sx={{
              width: "100%",
              height: 8,
              borderRadius: "999px",
              background: "var(--mui-palette-primary-main)",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              left: markerLeft,
              transform: "translateX(-50%)",
              width: 16,
              height: 16,
              borderRadius: "999px",
              bgcolor: "#fff",
              border: "3px solid var(--mui-palette-primary-main)",
              boxShadow: "var(--mui-palette-surface-primaryShadow)",
            }}
          />
        </Box>
        <Box sx={STEP_BTN} onClick={() => set(val + step)}>
          +
        </Box>
      </Box>
      {minLabel || maxLabel ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "text.disabled",
            mt: "6px",
            px: "36px",
          }}
        >
          <span>{minLabel}</span>
          <span>{maxLabel}</span>
        </Box>
      ) : null}
    </Box>
  );
}

/** Config-driven `slider` widget: bounds from `minimum`/`maximum`/`step`, the
 * value suffix from `unit` (a translation key), and end captions from
 * `minLabel`/`maxLabel`. */
export function SliderWidget({ prop, field, t, disabled }: WidgetProps) {
  return (
    <Slider
      value={Number(field.value ?? prop.default ?? prop.minimum ?? 0)}
      onChange={field.onChange}
      min={prop.minimum}
      max={prop.maximum}
      step={prop.step}
      suffix={prop.unit ? t(prop.unit) : undefined}
      label={prop.hideLabel ? undefined : prop.title ? t(prop.title) : undefined}
      minLabel={prop.minLabel ? t(prop.minLabel) : undefined}
      maxLabel={prop.maxLabel ? t(prop.maxLabel) : undefined}
      disabled={disabled}
    />
  );
}
