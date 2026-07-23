"use client";

import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { type AccessRule, type Route, usePortalRouter, useTranslation } from "@recruit/sdk";
import { useLayoutEffect, useRef, useState } from "react";

export interface TabNavItem {
  /** Translation key for the pill label. */
  label: string;
  /** Route this pill navigates to; also matched against `currentRoute`. */
  routeId: string;
  /** Optional soft chip beside the label (translation key), e.g. `Enterprise`. */
  badge?: string;
  /** Stripped by the engine when the user can't access it. */
  access?: AccessRule;
}

export interface TabNavConfiguration {
  /** Section title (translation key). */
  title?: string;
  /** Section subtitle (translation key). */
  subtitle?: string;
  /** Optional inline link rendered after the subtitle. */
  subtitleLink?: { text: string; routeId: string };
  tabs: TabNavItem[];
}

interface Indicator {
  left: number;
  top: number;
  width: number;
  height: number;
  ready: boolean;
}

/**
 * Config-driven pill tab bar with an optional titled header — the shared shell
 * behind every "tabs across the top of a settings-style area" screen. Each area
 * (workspace settings, my-account, …) is one `ComponentDefinition` pointing its
 * `value` here with its own `.Configuration` + `.Translation`; the engine
 * injects `configuration`/`currentRoute` and strips any tab the user can't see.
 */
export function TabNavRenderer({
  id,
  configuration,
  currentRoute,
}: {
  id: string;
  configuration?: Partial<TabNavConfiguration> & { tabs?: TabNavItem[] };
  currentRoute?: Route | null;
}) {
  const { t } = useTranslation(id);
  const router = usePortalRouter();
  const tabs = configuration?.tabs ?? [];
  const activeRouteId =
    tabs.find((tab) => tab.routeId === currentRoute?.id)?.routeId ?? tabs[0]?.routeId;
  const subtitleLink = configuration?.subtitleLink;

  // The active-pill slides between tabs: it's one absolutely-positioned element
  // measured against whichever tab is active, so `left`/`width` transitions do
  // the movement instead of a hard background swap.
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
      if (!activeRouteId) return;
      const el = tabRefs.current[activeRouteId];
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
  }, [activeRouteId, tabs.length]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      {configuration?.title || configuration?.subtitle ? (
        <Box>
          {configuration?.title ? (
            <Typography sx={{ fontSize: 17, fontWeight: 600 }}>{t(configuration.title)}</Typography>
          ) : null}
          {configuration?.subtitle ? (
            <Typography sx={{ fontSize: 12.5, color: "text.disabled", mt: "2px" }}>
              {t(configuration.subtitle)}
              {subtitleLink ? (
                <>
                  {" "}
                  <Link
                    component="button"
                    type="button"
                    onClick={() => router.push(subtitleLink.routeId)}
                    sx={{ fontSize: 12.5, fontWeight: 600, color: "warning.light" }}
                  >
                    {t(subtitleLink.text)}
                  </Link>
                </>
              ) : null}
            </Typography>
          ) : null}
        </Box>
      ) : null}

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
            background: (theme) => theme.gradients.primary,
            opacity: ind.ready ? 1 : 0,
            pointerEvents: "none",
            transition:
              "left .45s cubic-bezier(.3,1.4,.35,1), top .45s cubic-bezier(.3,1.4,.35,1), width .45s cubic-bezier(.3,1.4,.35,1), opacity .2s ease",
          }}
        />
        {tabs.map((tab) => {
          const active = tab.routeId === activeRouteId;
          return (
            <Box
              key={tab.routeId}
              ref={(el: HTMLDivElement | null) => {
                tabRefs.current[tab.routeId] = el;
              }}
              onClick={() => router.push(tab.routeId)}
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
                color: active ? "#fff" : "text.secondary",
                transition: "color .25s ease",
                "&:hover": { color: active ? "#fff" : "text.primary" },
              }}
            >
              {t(tab.label)}
              {tab.badge ? (
                <Box
                  component="span"
                  sx={{
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: active ? "#fff" : "warning.light",
                    bgcolor: active
                      ? "rgba(255,255,255,.2)"
                      : "var(--mui-palette-surface-warningSoftBg)",
                    border: active
                      ? "1px solid rgba(255,255,255,.3)"
                      : "1px solid var(--mui-palette-surface-warningSoftBorder)",
                    borderRadius: "999px",
                    px: "7px",
                    py: "2px",
                  }}
                >
                  {t(tab.badge)}
                </Box>
              ) : null}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
