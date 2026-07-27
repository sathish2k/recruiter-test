"use client";

import Box from "@mui/material/Box";
import type { CardProps } from "@mui/material/Card";
import { type ReactNode, useLayoutEffect, useRef, useState } from "react";

/**
 * Fill of the sliding pill. `gradient` is the settings tab nav (orange, white
 * label); `subtle` is the dashboard rail toggle — a white 10% wash keeping the
 * primary text colour, per the design.
 */
export type SlidingPillTone = "gradient" | "subtle";

export interface SlidingPillTabItem {
  value: string;
  /** Rendered with the active flag, so a tab can restyle its own badge/dot. */
  render: (active: boolean) => ReactNode;
}

interface Indicator {
  left: number;
  top: number;
  width: number;
  height: number;
  ready: boolean;
}

/**
 * The app's pill tab bar: one absolutely-positioned gradient pill measured
 * against the active tab, so switching *slides* it instead of swapping a
 * background. Shared by the settings tab nav and the dashboard rail filter —
 * one look, one motion curve, measured once here.
 */
export function SlidingPillTabs({
  items,
  value,
  onChange,
  tone = "gradient",
  sx,
}: {
  items: SlidingPillTabItem[];
  value?: string;
  onChange: (value: string) => void;
  tone?: SlidingPillTone;
  sx?: CardProps["sx"];
}) {
  const activeColor = tone === "subtle" ? "text.primary" : "#fff";
  const listRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [ind, setInd] = useState<Indicator>({
    left: 0,
    top: 0,
    width: 0,
    height: 0,
    ready: false,
  });

  // biome-ignore lint/correctness/useExhaustiveDependencies: re-measure on active change and tab count.
  useLayoutEffect(() => {
    const measure = () => {
      if (!value) return;
      const el = tabRefs.current[value];
      if (!el) return;
      setInd({
        left: el.offsetLeft,
        top: el.offsetTop,
        width: el.offsetWidth,
        height: el.offsetHeight,
        ready: true,
      });
    };
    measure();
    const list = listRef.current;
    if (!list || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [value, items.length]);

  return (
    <Box
      ref={listRef}
      sx={{
        position: "relative",
        display: "inline-flex",
        alignSelf: "flex-start",
        flexWrap: "wrap",
        gap: "2px",
        p: "4px",
        borderRadius: "999px",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        ...sx,
      }}
    >
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          left: `${ind.left}px`,
          top: `${ind.top}px`,
          width: `${ind.width}px`,
          height: `${ind.height}px`,
          borderRadius: "999px",
          background: (theme) =>
            tone === "subtle" ? theme.palette.surface.pillActive : theme.gradients.primary,
          opacity: ind.ready ? 1 : 0,
          pointerEvents: "none",
          transition:
            "left .45s cubic-bezier(.3,1.4,.35,1), top .45s cubic-bezier(.3,1.4,.35,1), width .45s cubic-bezier(.3,1.4,.35,1), opacity .2s ease",
        }}
      />
      {items.map((item) => {
        const active = item.value === value;
        return (
          <Box
            key={item.value}
            ref={(el: HTMLDivElement | null) => {
              tabRefs.current[item.value] = el;
            }}
            onClick={() => onChange(item.value)}
            sx={{
              position: "relative",
              zIndex: 1,
              display: "flex",
              alignItems: "center",
              gap: "6px",
              px: "14px",
              py: "7px",
              borderRadius: "999px",
              fontSize: 12.5,
              fontWeight: active ? 600 : 400,
              whiteSpace: "nowrap",
              cursor: "pointer",
              color: active ? activeColor : "text.secondary",
              transition: "color .25s ease",
              "&:hover": { color: active ? activeColor : "text.primary" },
            }}
          >
            {item.render(active)}
          </Box>
        );
      })}
    </Box>
  );
}
